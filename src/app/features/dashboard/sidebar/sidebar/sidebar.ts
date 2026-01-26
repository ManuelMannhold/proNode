import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { CreateNoteDialog } from '../../components/create-note-dialog/create-note-dialog';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

  constructor(private dialog: MatDialog) {}

openCreateNoteDialog() {
  this.dialog.open(CreateNoteDialog, {
    width: '450px',
    panelClass: 'custom-glass-dialog',
    data: { /* hier könntest du die aktuelle Ordner-ID übergeben */ }
  });
}
}
