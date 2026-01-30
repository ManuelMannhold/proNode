import { Injectable, signal, computed } from '@angular/core';
import { Folder, Note } from '../../models/note/note.model';


@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private foldersSignal = signal<Folder[]>([
    { id: 'root', name: 'Hauptverzeichnis', notes: [] },
    { id: 'f1', name: 'Projekt A', notes: [] }
  ]);

  folders = computed(() => this.foldersSignal());

  selectedNote = signal<Note | null>(null);

  addNote(newNote: Note) {
    this.foldersSignal.update((currentFolders: Folder[]) => {
      return currentFolders.map(folder => {
        if (folder.id === newNote.parentId) {
          return {
            ...folder,
            notes: [...folder.notes, newNote]
          };
        }
        console.log('nachricht gespeichert', folder);
        return folder;
      });
    });
  }

  selectNote(note: Note) {
    this.selectedNote.set(note);
  }
}