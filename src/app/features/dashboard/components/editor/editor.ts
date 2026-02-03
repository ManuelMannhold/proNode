import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../../../core/services/note/note.service';

@Component({
  selector: 'app-editor',
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor {
  constructor(public noteService: NoteService) {}
  noteTitle = signal('test2');
  noteContent = signal('');
  saveStatus = signal('Alle Änderungen gespeichert');

  saveNote() {
    this.saveStatus.set('Speichere...');
    setTimeout(() => this.saveStatus.set('Gerade gespeichert'), 800);
  }
}
