import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Note } from '../../../../core/models/note/note.model'; // Nur das Interface
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NoteService } from '../../../../core/services/note/note.service';

@Component({
  selector: 'app-create-note-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule
  ],
  templateUrl: './create-note-dialog.html',
  styleUrl: './create-note-dialog.scss',
})
export class CreateNoteDialog {
  private noteService = inject(NoteService);
  private dialogRef = inject(MatDialogRef<CreateNoteDialog>);

  noteForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required]),
    parentFolder: new FormControl('root')
  });

  folders = [
    { id: 'root', name: 'Hauptverzeichnis' },
    { id: 'f1', name: 'Projekt A' },
    { id: 'f2', name: 'Ideen-Sammlung' }
  ];

  closeDialog() {
    this.dialogRef.close();
  }

  saveNote() {
  if (this.noteForm.invalid) return;
  const { title, content, parentFolder } = this.noteForm.getRawValue();

  const newNote: Note = {
    id: Date.now().toString(),
    title: title ?? '',  
    content: content ?? '',   
    parentId: parentFolder ?? 'root',
    createdAt: new Date()
  };

  this.noteService.addNote(newNote)
    .then(() => this.dialogRef.close())
    .catch(err => console.error('Fehler:', err));
}
}