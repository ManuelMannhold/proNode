import { Component, inject } from '@angular/core';
import { Sidebar } from './sidebar/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';
import { RouterOutlet } from '@angular/router';
import { NoteService } from '../../core/services/note/note.service';
import { AuthService } from '../../core/services/auth/auth.service'; // Dein Service!

@Component({
  selector: 'app-dashboard',
  standalone: true, // Falls nicht schon durch Imports impliziert
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  // Nutze inject() für einen sauberen Look, passend zu deinem Header
  public noteService = inject(NoteService);
  public authService = inject(AuthService);

  // Die Signals im Dashboard sind nur nötig, wenn du sie im dashboard.html nutzt.
  // Falls du sie nur im Header brauchst, kannst du diesen Block hier löschen.
  userName = this.authService.user; // Verweist direkt auf das Signal im Service
}