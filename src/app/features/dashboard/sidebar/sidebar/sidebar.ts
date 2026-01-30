import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { CreateNoteDialog } from '../../components/create-note-dialog/create-note-dialog';
import { Router } from '@angular/router';
import { Folder } from '../../../../core/models/note/note.model';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  animations: [
    trigger('folderAnimation', [
      transition(':enter', [ // Wenn ein Element neu dazukommt
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [ // Wenn ein Element gelöscht wird
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})

export class Sidebar {
  constructor(private dialog: MatDialog, private router: Router) { }

  folders = signal<Folder[]>([]);

  @ViewChild('nameInput') set nameInput(element: ElementRef<HTMLInputElement>) {
    if (element) {
      setTimeout(() => {
        element.nativeElement.focus();
        element.nativeElement.select();
      }, 0);
    }
  }

  addFolder() {
    const newId = Date.now().toString();
    this.folders.update(allFolders => [{ id: newId, name: '', notes: [], isEditing: true }, ...allFolders]);
  }

  saveName(folderId: string, event: any) {
    const newName = event.target.value.trim();

    this.folders.update(allFolders => {
      if (newName === '') {
        return allFolders.filter(f => f.id !== folderId);
      }
      return allFolders.map(folder =>
        folder.id === folderId ? { ...folder, name: newName, isEditing: false } : folder
      );
    });
  }

  openCreateNoteDialog() {
    this.dialog.open(CreateNoteDialog, {
      width: '450px',
      panelClass: 'custom-glass-dialog',
      data: { /* hier könntest du die aktuelle Ordner-ID übergeben */ }
    });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
