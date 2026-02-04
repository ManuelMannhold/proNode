import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-legal-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIcon],
  templateUrl: './legal-dialog.html',
  styleUrl: './legal-dialog.scss',
})
export class LegalDialog {
  private snackBar = inject(MatSnackBar);

  emailSignal = signal('contact@manuel-mannhold.de');
  data = inject(MAT_DIALOG_DATA);

  sendMail() {
    window.location.href = `mailto:${this.emailSignal()}`;
  }

  copyEmail() {
    navigator.clipboard.writeText(this.emailSignal());
    this.snackBar.open('E-Mail kopiert!', 'Check', {
      duration: 2000,
      panelClass: ['custom-snackbar']
    });
  }
}
