import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NoteService } from '../../../../core/services/note/note.service';
import { Note } from '../../../../core/models/note/note.model';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class Welcome {
  private router = inject(Router);
  private noteService = inject(NoteService);
  isSidebarExpanded = signal(false);

  /**
   * Opens the sidebar and creates a new note. 
   * If no folders exist, it creates a folder stub first.
   * @returns {Promise<void>}
   */
  async openCreateNoteDialog() {
    const folders = this.noteService.folders();

    this.noteService.isSidebarExpanded.set(true);

    if (folders.length === 0) {
      const folderId = 'folder-' + Date.now();
      this.noteService.addFolderStub(folderId);
      return;
    }

    const firstFolderId = folders[0].id;
    const newId = crypto.randomUUID();

    const newNote: Note = {
      id: newId,
      title: 'Neue Notiz',
      parentId: firstFolderId,
      content: '',
      createdAt: new Date().toISOString()
    };

    try {
      await this.noteService.addNote(newNote);
      this.router.navigate(['/dashboard/note', newId]);
    } catch (error) {
      console.error('Fehler beim Erstellen der Notiz:', error);
    }
  }

  /**
     * Toggles the sidebar expansion state or sets it to a specific value.
     * @param {boolean} [value] - Optional boolean to force a specific state.
     */
  toggleSidebar(value?: boolean) {
    this.isSidebarExpanded.set(value ?? !this.isSidebarExpanded());
  }

  /**
     * Opens the sidebar and adds a temporary folder stub for immediate editing.
     */
  addFolder() {
    this.noteService.isSidebarExpanded.set(true);

    const tempId = 'folder-' + Date.now();
    this.noteService.addFolderStub(tempId);
  }
}
