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
export class Header {
  public noteService = inject(NoteService);
  public authService = inject(AuthService);

  displayLetter = computed(() => {
    const user = this.authService.user();

    if (!user || user.isAnonymous) {
      return 'Gast';
    }

    if (user.email) {
      const namePart = user.email.split('@')[0];

      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }

    return 'U';
  });
}