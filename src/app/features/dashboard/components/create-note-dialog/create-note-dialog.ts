import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent } from "@angular/material/dialog";
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-create-note-dialog',
  imports: [MatDialogContent, MatFormField, MatLabel, MatInput, MatDialogActions, MatDialogClose, MatButtonModule],
  templateUrl: './create-note-dialog.html',
  styleUrl: './create-note-dialog.scss',
})
export class CreateNoteDialog {
  
}
