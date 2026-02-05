import { Component, inject } from '@angular/core';
import { Sidebar } from './sidebar/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';
import { RouterOutlet } from '@angular/router';
import { NoteService } from '../../core/services/note/note.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  public noteService = inject(NoteService);
  public authService = inject(AuthService);
  userName = this.authService.user;
}