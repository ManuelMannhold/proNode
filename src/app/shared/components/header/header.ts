import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NoteService } from '../../../core/services/note/note.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: 'header.html',
  styleUrl: 'header.scss',
})
export class Header { // OnInit kannst du entfernen, wenn du kein localStorage mehr nutzt
  public noteService = inject(NoteService);
  public authService = inject(AuthService);

  // Das Signal berechnet alles automatisch basierend auf dem Firebase-Status
  displayLetter = computed(() => {
    const user = this.authService.user();

    // Fall 1: Kein User oder Anonym -> Immer großes G
    if (!user || user.isAnonymous) {
      return 'Gast';
    }

    // Fall 2: Eingeloggter User -> Erster Buchstabe der Mail
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return 'U';
  });

  // ngOnInit und currentUser können komplett raus, 
  // da wir jetzt nur noch mit dem authService.user() Signal arbeiten.
}