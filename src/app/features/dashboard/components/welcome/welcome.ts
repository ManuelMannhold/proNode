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


  toggleSidebar(value?: boolean) {
    this.isSidebarExpanded.set(value ?? !this.isSidebarExpanded());
  }


  addFolder() {
    // Sidebar öffnen
    this.noteService.isSidebarExpanded.set(true);

    const tempId = 'folder-' + Date.now();
    this.noteService.addFolderStub(tempId);
  }
}
