import { Component, inject } from '@angular/core';
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

  async openCreateNoteDialog() {
    const folders = this.noteService.folders();
    
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

  addFolder() {
    const tempId = 'folder-' + Date.now();
    this.noteService.addFolderStub(tempId);
    // Da isEditing im Service auf true gesetzt wird, 
    // kann der User direkt in der Sidebar den Namen tippen.
  }
}