import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { Database, ref, onValue, set, remove, update, query, orderByChild } from '@angular/fire/database';
import { Folder, Note } from '../../models/note/note.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private db = inject(Database);
  private authService = inject(AuthService);
  private foldersSignal = signal<Folder[]>([]);
  public allNotesSignal = signal<Note[]>([]);
  public selectedNote = signal<Note | null>(null);
  public isSaving = signal(false);
  isSidebarExpanded = signal<boolean>(false);
  private foldersPath = computed(() => {
    const user = this.authService.user();
    return user ? `users/${user.uid}/folders` : 'public_folders';
  });

  private notesPath = computed(() => {
    const user = this.authService.user();
    return user ? `users/${user.uid}/notes` : 'public_notes';
  });
  public folders = computed(() => {
    const folders = this.foldersSignal();
    const notes = this.allNotesSignal();

    return folders.map(folder => ({
      ...folder,
      notes: notes.filter(n => n.parentId === folder.id)
    }));
  });

  constructor() {
    this.initFirebaseSync();
    effect(() => {
      const currentNote = this.selectedNote();
      if (currentNote) {
        const updatedNote = this.allNotesSignal().find(n => n.id === currentNote.id);
        if (updatedNote && JSON.stringify(updatedNote) !== JSON.stringify(currentNote)) {
          this.selectedNote.set(updatedNote);
        }
      }
    });
  }

  private initFirebaseSync() {
    effect(() => {
      const fPath = this.foldersPath();
      const nPath = this.notesPath();
      const foldersQuery = query(ref(this.db, fPath), orderByChild('position'));
      onValue(foldersQuery, (snapshot) => {
        const folders: Folder[] = [];
        snapshot.forEach((child) => {
          folders.push({ ...child.val(), id: child.key, notes: [], isEditing: false });
        });
        this.foldersSignal.set(folders);
      });

      onValue(ref(this.db, nPath), (snapshot) => {
        const notes: Note[] = [];
        snapshot.forEach((child) => {
          notes.push({ ...child.val(), id: child.key });
        });
        this.allNotesSignal.set(notes);
      });
    });
  }

  toggleSidebar(value?: boolean) {
    this.isSidebarExpanded.set(value ?? !this.isSidebarExpanded());
  }

  addNote(newNote: Note) {
    const path = `${this.notesPath()}/${newNote.id}`;
    return set(ref(this.db, path), {
      title: newNote.title,
      content: newNote.content || '',
      parentId: newNote.parentId
    });
  }

  saveFolder(id: string, name: string) {
    const folder = this.foldersSignal().find(f => f.id === id);
    const path = `${this.foldersPath()}/${id}`;
    return update(ref(this.db, path), {
      name: name,
      position: folder?.position ?? 0
    });
  }

  async updateNoteContent(noteId: string, content: string) {
    const path = `${this.notesPath()}/${noteId}/content`;
    try {
      await set(ref(this.db, path), content);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  }

  async deleteNote(noteId: string) {
    const path = `${this.notesPath()}/${noteId}`;
    try {
      await remove(ref(this.db, path));
      if (this.selectedNote()?.id === noteId) {
        this.selectedNote.set(null);
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  }

  deleteFolder(id: string) {
    return remove(ref(this.db, `${this.foldersPath()}/${id}`));
  }

  async updateFolderPositions(folders: Folder[]) {
    const updates: any = {};
    const basePath = this.foldersPath();
    folders.forEach((folder, index) => {
      updates[`${basePath}/${folder.id}/position`] = index;
    });
    return update(ref(this.db), updates);
  }

  getNoteById(id: string): Note | undefined {
    return this.allNotesSignal().find(n => n.id === id);
  }

  async moveNote(noteId: string, newFolderId: string) {
    const path = `${this.notesPath()}/${noteId}/parentId`;
    return set(ref(this.db, path), newFolderId);
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