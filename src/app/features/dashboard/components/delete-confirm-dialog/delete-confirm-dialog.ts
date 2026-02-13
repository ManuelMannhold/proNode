import { Component } from '@angular/core';
import { MatDialogContent, MatDialogActions, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-delete-confirm-dialog',
  imports: [MatDialogContent, MatDialogActions],
  templateUrl: './delete-confirm-dialog.html',
  styleUrl: './delete-confirm-dialog.scss',
})
export class DeleteConfirmDialog {
  constructor(private dialogRef: MatDialogRef<DeleteConfirmDialog>) { }

  onCancel(): void { this.dialogRef.close(false); }
  onConfirm(): void { this.dialogRef.close(true); }
}
