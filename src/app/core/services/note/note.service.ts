import { Injectable, signal, inject, computed } from '@angular/core';
import { Database, ref, onValue, set, remove, update, query, orderByChild } from '@angular/fire/database';
import { Folder, Note } from '../../models/note/note.model';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private db = inject(Database);
  private foldersSignal = signal<Folder[]>([]);
  public folders = computed(() => this.foldersSignal());
  public selectedNote = signal<Note | null>(null);
  public isSaving = signal(false);

  constructor() { this.initFirebaseSync(); }

  private initFirebaseSync() {
    const foldersQuery = query(ref(this.db, 'folders'), orderByChild('position'));

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

        // Notizen-Mapping: Wir brauchen die Keys als IDs!
        const notesArray: Note[] = val.notes
          ? Object.entries(val.notes).map(([noteId, noteData]: [string, any]) => ({
            ...noteData,
            id: noteId,
            parentId: folderId,
            content: noteData.content || '' // Sicherstellen, dass content existiert
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
  }

  getNoteSignal(id: string) {
    return computed(() => {
      for (const folder of this.foldersSignal()) {
        const note = folder.notes.find(n => n.id === id);
        if (note) return note;
      }
      return undefined;
    });
  }

  addNote(newNote: Note) {
    const noteRef = ref(this.db, `folders/${newNote.parentId}/notes/${newNote.id}`);
    return set(noteRef, newNote);
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

  saveFolder(id: string, name: string) {
    const folder = this.foldersSignal().find(f => f.id === id);
    set(ref(this.db, `folders/${id}`), {
      name,
      notes: {},
      position: folder?.position ?? 0
    });
  }

  async updateFolderPositions(folders: Folder[]) {
    const updates: any = {};

    folders.forEach((folder, index) => {
      updates[`folders/${folder.id}/position`] = index;
    });

    try {
      await update(ref(this.db), updates);
      console.log('Positionen dauerhaft gespeichert');
    } catch (error) {
      console.error('Fehler beim Speichern der Positionen:', error);
    }
  }

  getNoteById(id: string): Note | undefined {
    for (const folder of this.foldersSignal()) {
      const note = folder.notes.find(n => n.id === id);
      if (note) return note;
    }
    return undefined;
  }

  async updateNoteContent(folderId: string, noteId: string, content: string) {
    const contentRef = ref(this.db, `folders/${folderId}/notes/${noteId}/content`);
    try {
      await set(contentRef, content);
    } catch (error) {
      console.error('Fehler beim Speichern des Inhalts:', error);
    }
  }

  deleteFolder(id: string) {
    remove(ref(this.db, `folders/${id}`));
  }

  selectNote(note: Note) {
    this.selectedNote.set(note);
  }

  updateLocalOrder(newOrder: Folder[]) {
    this.foldersSignal.set(newOrder);
  }
}