import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { Database, ref, onValue, set, remove, update, query, orderByChild } from '@angular/fire/database';
import { Folder, Note } from '../../models/note/note.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private db = inject(Database);
  private authService = inject(AuthService);
  public foldersSignal = signal<Folder[]>([]);
  public folders = computed(() => this.foldersSignal());
  public selectedNote = signal<Note | null>(null);
  public isSaving = signal(false);

  // Der dynamische Basispfad basierend auf dem Login-Status
  private notesPath = computed(() => {
    const user = this.authService.user();
    // Nutzt die UID für private Daten, sonst einen Fallback-Ordner
    return user ? `users/${user.uid}/folders` : 'public_folders';
  });

  constructor() {
    this.initFirebaseSync();
    
    // Synchronisiert die ausgewählte Notiz, wenn sich die Daten im Hintergrund ändern
    effect(() => {
      const currentNote = this.selectedNote();
      if (currentNote) {
        const updatedNote = this.getNoteById(currentNote.id);
        if (updatedNote && updatedNote !== currentNote) {
          this.selectedNote.set(updatedNote);
        }
      }
    }, { allowSignalWrites: true });
  }

  private initFirebaseSync() {
    // Reagiert automatisch, wenn sich der notesPath (User-Login) ändert
    effect(() => {
      const currentPath = this.notesPath();
      const foldersQuery = query(ref(this.db, currentPath), orderByChild('position'));

      // Bestehende Verbindung abhören
      onValue(foldersQuery, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          this.foldersSignal.set([]);
          return;
        }

        const list: Folder[] = [];
        snapshot.forEach((child) => {
          const val = child.val();
          const folderId = child.key as string;

          const notesArray: Note[] = val.notes
            ? Object.entries(val.notes).map(([noteId, noteData]: [string, any]) => ({
                ...noteData,
                id: noteId,
                parentId: folderId,
                content: noteData.content || ''
              }))
            : [];

          list.push({
            ...val,
            id: folderId,
            notes: notesArray,
            isEditing: false
          });
        });

        this.foldersSignal.set(list);
      });
    });
  }

  // --- Schreiboperationen mit dynamischem Pfad ---

  addNote(newNote: Note) {
    const path = `${this.notesPath()}/${newNote.parentId}/notes/${newNote.id}`;
    console.log('📝 Speicher NOTIZ in Pfad:', path);
    return set(ref(this.db, path), newNote);
  }

  saveFolder(id: string, name: string) {
    const folder = this.foldersSignal().find(f => f.id === id);
    const path = `${this.notesPath()}/${id}`;
    console.log('📂 Speicher ORDNER in Pfad:', path);
    return set(ref(this.db, path), {
      name,
      notes: {},
      position: folder?.position ?? 0
    });
  }

  async updateNoteContent(folderId: string, noteId: string, content: string) {
    const path = `${this.notesPath()}/${folderId}/notes/${noteId}/content`;
    try {
      await set(ref(this.db, path), content);
    } catch (error) {
      console.error('Fehler beim Speichern des Inhalts:', error);
    }
  }

  async deleteNote(folderId: string, noteId: string) {
    const path = `${this.notesPath()}/${folderId}/notes/${noteId}`;
    try {
      await remove(ref(this.db, path));
      if (this.selectedNote()?.id === noteId) {
        this.selectedNote.set(null);
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Notiz:', error);
    }
  }

  deleteFolder(id: string) {
    return remove(ref(this.db, `${this.notesPath()}/${id}`));
  }

  async updateFolderPositions(folders: Folder[]) {
    const updates: any = {};
    const basePath = this.notesPath();

    folders.forEach((folder, index) => {
      // Hier bauen wir den Pfad für das Multi-Update zusammen
      updates[`${basePath}/${folder.id}/position`] = index;
    });

    try {
      await update(ref(this.db), updates);
    } catch (error) {
      console.error('Fehler beim Speichern der Positionen:', error);
    }
  }

  // --- Hilfsmethoden ---

  getNoteById(id: string): Note | undefined {
    for (const folder of this.foldersSignal()) {
      const note = folder.notes.find(n => n.id === id);
      if (note) return note;
    }
    return undefined;
  }

  getNoteSignal(id: string) {
    return computed(() => this.getNoteById(id));
  }

  addFolderStub(id: string) {
    const minPos = Math.min(...this.foldersSignal().map(f => f.position), 0) - 1;
    this.foldersSignal.update(all => [{
      id, name: '', notes: [], isEditing: true, position: minPos
    }, ...all]);
  }

  removeFolderStub(id: string) {
    this.foldersSignal.update(all => all.filter(f => f.id !== id));
  }

  setEditing(id: string, isEditing: boolean) {
    this.foldersSignal.update(all =>
      all.map(f => f.id === id ? { ...f, isEditing } : f)
    );
  }

  selectNote(note: Note) {
    this.selectedNote.set(note);
  }

  updateLocalOrder(newOrder: Folder[]) {
    this.foldersSignal.set(newOrder);
  }
}