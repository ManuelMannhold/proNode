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
  folders = this.noteService.foldersSignal;

  noteForm = new FormGroup({
    title: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    parentFolder: new FormControl('root', { nonNullable: true })
  });

  closeDialog() {
    this.dialogRef.close();
  }

  saveNote() {
    if (this.noteForm.invalid) return;
    const { title, parentFolder } = this.noteForm.getRawValue();

    const newNote: Note = {
      id: Date.now().toString(),
      title: title ?? '',
      parentId: parentFolder,
      createdAt: new Date().toISOString()
    };

    this.noteService.addNote(newNote as any)
      .then(() => this.dialogRef.close())
      .catch(err => console.error('Fehler beim Speichern:', err));
  }
}