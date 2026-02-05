import { Component, Inject, inject } from '@angular/core';
import { Database, ref } from '@angular/fire/database';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  private authService = inject(AuthService);
  private db = inject(Database);

  /**
   * Retrieves the database reference for the current user's notes path.
   * @returns {DatabaseReference | null} The Firebase reference or null if no user is authenticated.
   */
  getNotes() {
    const user = this.authService.user();

    if (user) {
      return ref(this.db, `users/${user.uid}/notes`);
    }
    return null;
  }
}
