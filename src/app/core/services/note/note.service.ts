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
  isSidebarExpanded = signal<boolean>(false);

  private notesPath = computed(() => {
    const user = this.authService.user();
    return user ? `users/${user.uid}/folders` : 'public_folders';
  });

  constructor() {
    this.initFirebaseSync();

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

  /**
   * Synchronizes folders and notes from Firebase Realtime Database using an effect.
   * @private
   */
  private initFirebaseSync() {
    effect(() => {
      const currentPath = this.notesPath();
      const foldersQuery = query(ref(this.db, currentPath), orderByChild('position'));

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

  /**
   * Toggles the sidebar expansion state.
   * @param {boolean} [value] - Optional specific state to set.
   */
  toggleSidebar(value?: boolean) {
    this.isSidebarExpanded.set(value ?? !this.isSidebarExpanded());
  }

  /**
   * Creates or updates a note in the database at the specified path.
   * @param {Note} newNote - The note object to save.
   * @returns {Promise<void>}
   */
  addNote(newNote: Note) {
    const path = `${this.notesPath()}/${newNote.parentId}/notes/${newNote.id}`;
    return set(ref(this.db, path), newNote);
  }

  /**
   * Saves or updates a folder's name and position in the database.
   * @param {string} id - The folder ID.
   * @param {string} name - The new folder name.
   * @returns {Promise<void>}
   */
  saveFolder(id: string, name: string) {
    const folder = this.foldersSignal().find(f => f.id === id);
    const path = `${this.notesPath()}/${id}`;
    return set(ref(this.db, path), {
      name,
      notes: {},
      position: folder?.position ?? 0
    });
  }

  /**
   * Updates only the content field of a specific note.
   * @param {string} folderId - ID of the parent folder.
   * @param {string} noteId - ID of the note to update.
   * @param {string} content - The new text content.
   */
  async updateNoteContent(folderId: string, noteId: string, content: string) {
    const path = `${this.notesPath()}/${folderId}/notes/${noteId}/content`;
    try {
      await set(ref(this.db, path), content);
    } catch (error) {
      console.error('Fehler beim Speichern des Inhalts:', error);
    }
  }

  /**
   * Deletes a note and clears it from the selection if active.
   * @param {string} folderId - ID of the parent folder.
   * @param {string} noteId - ID of the note to remove.
   */
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

  /**
   * Deletes a folder and all its contents from the database.
   * @param {string} id - The folder ID to remove.
   * @returns {Promise<void>}
   */
  deleteFolder(id: string) {
    return remove(ref(this.db, `${this.notesPath()}/${id}`));
  }

  /**
   * Batch updates the sorting positions of all folders in the database.
   * @param {Folder[]} folders - Array of folders in their new order.
   */
  async updateFolderPositions(folders: Folder[]) {
    const updates: any = {};
    const basePath = this.notesPath();

    folders.forEach((folder, index) => {
      updates[`${basePath}/${folder.id}/position`] = index;
    });

    try {
      await update(ref(this.db), updates);
    } catch (error) {
      console.error('Fehler beim Speichern der Positionen:', error);
    }
  }

  /**
   * Searches the current local state for a note by its ID.
   * @param {string} id - The note ID.
   * @returns {Note | undefined}
   */
  getNoteById(id: string): Note | undefined {
    for (const folder of this.foldersSignal()) {
      const note = folder.notes.find(n => n.id === id);
      if (note) return note;
    }
    return undefined;
  }

  /**
   * Returns a computed signal for a specific note's data.
   * @param {string} id - The note ID.
   */
  getNoteSignal(id: string) {
    return computed(() => this.getNoteById(id));
  }

  /**
   * Adds a temporary folder entry to the local signal for immediate UI feedback.
   * @param {string} id - The temporary ID for the stub.
   */
  addFolderStub(id: string) {
    const minPos = Math.min(...this.foldersSignal().map(f => f.position), 0) - 1;
    this.foldersSignal.update(all => [{
      id, name: '', notes: [], isEditing: true, position: minPos
    }, ...all]);
  }

  /**
   * Removes a temporary folder entry from the local signal.
   * @param {string} id - The ID of the stub to remove.
   */
  removeFolderStub(id: string) {
    this.foldersSignal.update(all => all.filter(f => f.id !== id));
  }

  /**
   * Toggles the editing mode for a specific folder in the UI.
   * @param {string} id - The folder ID.
   * @param {boolean} isEditing - Whether the folder is being renamed.
   */
  setEditing(id: string, isEditing: boolean) {
    this.foldersSignal.update(all =>
      all.map(f => f.id === id ? { ...f, isEditing } : f)
    );
  }

  /**
   * Updates the global selection state with the provided note.
   * @param {Note} note - The note to select.
   */
  selectNote(note: Note) {
    this.selectedNote.set(note);
  }

  /**
   * Synchronizes the local folder signal order without immediate database triggering.
   * @param {Folder[]} newOrder - The reordered folder array.
   */
  updateLocalOrder(newOrder: Folder[]) {
    this.foldersSignal.set(newOrder);
  }
}