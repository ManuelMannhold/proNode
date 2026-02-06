import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NoteService } from '../../../../core/services/note/note.service';
import { Note } from '../../../../core/models/note/note.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateNoteDialog } from '../create-note-dialog/create-note-dialog';

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
  private dialog = inject(MatDialog);
  isSidebarExpanded = signal(false);


  /**
   * Opens the creation dialog, ensuring at least one default folder exists.
   * Passes the first available folder ID as the default selection.
   * @returns {Promise<void>}
   */
  async openCreateNoteDialog() {
    let folders = this.noteService.folders();

    if (folders.length === 0) {
      const defaultFolderId = 'folder-' + Date.now();
      await this.noteService.addFolderStub(defaultFolderId);
      await this.noteService.saveFolder(defaultFolderId, 'Meine Notizen');

      folders = this.noteService.folders();
    }

    const DIALOGREF = this.dialog.open(CreateNoteDialog, {
      width: '450px',
      panelClass: 'custom-glass-dialog',
      data: { defaultFolder: folders[0].id }
    });

    DIALOGREF.afterClosed().subscribe(result => {
      if (result) {
        const mockId = Math.random().toString(36).substring(7);
        this.router.navigate(['/dashboard/note', mockId]);
      }
    });
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
