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
  

  getNotes() {
    const user = this.authService.user(); // Unser neues Signal!

    if (user) {
      // Wir speichern jetzt UNTER der UID des Users
      // Vorher war es wahrscheinlich einfach nur 'notes'
      return ref(this.db, `users/${user.uid}/notes`);
    }
    return null;
  }
}
