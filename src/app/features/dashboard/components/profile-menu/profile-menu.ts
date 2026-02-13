import { Component, inject, ViewChild } from '@angular/core';
import { MatMenu } from "@angular/material/menu";
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { Auth, signOut, user } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile-menu',
  imports: [MatMenu, MatDivider, MatIcon],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.scss',
  template: `
    <mat-menu #profileMenu="matMenu" class="custom-glass-menu" xPosition="after" yPosition="below">
       </mat-menu>
  `
})
export class ProfileMenu {
  @ViewChild('profileMenu') profileMenu!: MatMenu;

  private snackBar = inject(MatSnackBar);
  public authService = inject(AuthService);
  private router = inject(Router);
  private auth = inject(Auth);

  currentUser = toSignal(user(this.auth));


  /**
  * Displays a temporary notification regarding the availability of settings.
  */
  goToSettings() {
    this.snackBar.open('Einstellungen folgen bald...', 'OK', { duration: 2000 });
  }


  /**
   * Clears local session data, signs out from Firebase, and redirects to login.
   * @returns {Promise<void>}
   */
  async logout() {
    localStorage.removeItem('currentUser');
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }


  /**
   * Derives a display name from user object properties (displayName or email).
   * @param {any} user - The current user object.
   * @returns {string} The formatted name, 'Gast', or 'User'.
   */
  getUserDisplayName(user: any): string {
    if (!user) return 'Gast';
    if (user.displayName) return user.displayName;
    if (user.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
    }
    return 'User';
  }

  deleteUserAccount() {
    this.authService.deleteUserAccount().then(() => {
      this.snackBar.open('Account erfolgreich gelöscht', 'OK', { duration: 2000 });
      this.logout();
    }).catch((error) => {
      console.error('Fehler beim Löschen des Accounts:', error);
      this.snackBar.open('Fehler beim Löschen des Accounts', 'OK', { duration: 2000 });
    });
  }
}
