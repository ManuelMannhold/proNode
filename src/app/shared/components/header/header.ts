import { ChangeDetectorRef, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NoteService } from '../../../core/services/note/note.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ProfileMenu } from "../../../features/dashboard/components/profile-menu/profile-menu";
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, ProfileMenu, MatMenuModule],
  templateUrl: 'header.html',
  styleUrl: 'header.scss',
})
export class Header {
  public noteService = inject(NoteService);
  public authService = inject(AuthService);
  private cd = inject(ChangeDetectorRef);
  isLoggedIn = signal(false);
  displayName = signal<string>('...');

  constructor() {
    effect(() => {
      const user = this.authService.user();
      let name = 'U';

      if (!user || user.isAnonymous) {
        name = 'Gast';
      } else if (user.email) {
        const namePart = user.email.split('@')[0];
        name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }

      Promise.resolve().then(() => {
        this.isLoggedIn.set(!!user);
        this.displayName.set(name);
        this.cd.detectChanges();
      });
    });
  }
}