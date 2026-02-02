import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NoteService } from '../../../../core/services/note/note.service';
import { Folder, Note } from '../../../../core/models/note/note.model';
import { CreateNoteDialog } from '../../components/create-note-dialog/create-note-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, CommonModule, CdkDropList, CdkDrag, MatMenuModule,
    MatIconModule,
    MatButtonModule, MatTooltipModule],
  template: `
    <h2 mat-dialog-title>Ordner löschen?</h2>
    <mat-dialog-content>
      Bist du sicher? Alle Notizen in diesem Ordner gehen verloren.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Abbrechen</button>
      <button mat-button [mat-dialog-close]="true" color="warn">Löschen</button>
    </mat-dialog-actions>
  `,
  styles: [`mat-dialog-content { color: #ccd6f6; padding-bottom: 20px; }
    h2 { color: #ff5252; }`],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  animations: [
    trigger('folderAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})

export class Sidebar {
  public noteService = inject(NoteService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  folders = this.noteService.folders;
  selectedFolderId = signal<string | null>(null);

  @ViewChild('nameInput') set nameInput(element: ElementRef<HTMLInputElement>) {
    if (element) {
      setTimeout(() => {
        element.nativeElement.focus();
        element.nativeElement.select();
      }, 0);
    }
  }

  // --- Ordner Funktionen ---

  addFolder() {
    const newId = Date.now().toString();
    this.noteService.addFolderStub(newId);
  }

  saveName(folderId: string, event: any) {
  const newName = event.target.value.trim();
  if (newName) {
    this.noteService.saveFolder(folderId, newName);
    this.noteService.setEditing(folderId, false);
  } else {
    this.noteService.removeFolderStub(folderId);
  }
}

  selectFolder(id: string) {
    this.selectedFolderId.set(id);
  }

  deleteFolder(id: string) {
    if (confirm('Möchtest du diesen Ordner wirklich löschen?')) {
      this.noteService.deleteFolder(id);
    }
  }

  // --- Notiz Funktionen ---

  onNoteClick(note: Note) {
    this.noteService.selectNote(note);
  }

  openCreateNoteDialog() {
    this.dialog.open(CreateNoteDialog, {
      width: '450px',
      panelClass: 'custom-glass-dialog'
    });
  }

  drop(event: CdkDragDrop<Folder[]>) {
    const currentFolders = [...this.folders()];
    moveItemInArray(currentFolders, event.previousIndex, event.currentIndex);
    this.noteService.updateLocalOrder(currentFolders);
    this.noteService.updateFolderPositions(currentFolders);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}