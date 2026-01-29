import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { CreateNoteDialog } from '../../components/create-note-dialog/create-note-dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

  constructor(private dialog: MatDialog, private router: Router) {}

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
