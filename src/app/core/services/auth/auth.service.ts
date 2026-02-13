import { inject, Injectable } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
  signInAnonymously,
  deleteUser
} from '@angular/fire/auth';
import {
  getFirestore,
  doc,
  deleteDoc
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmDialog } from '../../../features/dashboard/components/delete-confirm-dialog/delete-confirm-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  user = toSignal(authState(this.auth));
  user$ = authState(this.auth);
  private showMessage(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['custom-snackbar']
    });
  }

  /**
   * Authenticates a user with email and password.
   * @param {string} email - The user's email address.
   * @param {string} pass - The user's password.
   * @returns {Promise<UserCredential>}
   */
  async login(email: string, pass: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, pass);
      return credential;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Performs authentication via Google OAuth popup.
   * @returns {Promise<UserCredential>}
   */
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      return result;
    } catch (error) {
      console.error("Google Login Fehler:", error);
      throw error;
    }
  }

  /**
   * Signs in a user anonymously as a guest.
   * @returns {Promise<UserCredential>}
   */
  async loginAsGuest() {
    try {
      return await signInAnonymously(this.auth);
    } catch (error) {
      console.error("Firebase Gast-Login fehlgeschlagen:", error);
      throw error;
    }
  }

  /**
   * Creates a new user account with email and password.
   * @param {string} email - The user's email address.
   * @param {string} pass - The user's password.
   * @returns {Promise<UserCredential>}
   */
  async register(email: string, pass: string) {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, pass);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logs out the current user and navigates to the login route.
   * @returns {Promise<void>}
   */
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  async deleteUserAccount() {
  const user = this.auth.currentUser;
  if (!user) return;

  const dialogRef = this.dialog.open(DeleteConfirmDialog, {
    width: '350px',
    panelClass: 'custom-glass-dialog'
  });

  dialogRef.afterClosed().subscribe(async (confirmed) => {
    if (!confirmed) return;

    try {
      await deleteUser(user);
      this.showMessage('Account erfolgreich gelöscht. Auf Wiedersehen!');
      this.router.navigate(['/login']);
      
    } catch (error: any) {
      console.error("Löschfehler:", error);
      if (error.code === 'auth/requires-recent-login') {
        this.showMessage('Sicherheits-Check: Bitte logge dich erneut ein, um das Löschen zu bestätigen.');
        await this.logout();
      } else {
        this.showMessage('Etwas ist schiefgelaufen. Bitte versuche es später erneut.');
      }
    }
  });
}
}