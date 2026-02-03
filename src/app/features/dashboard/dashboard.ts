import { Component, inject } from '@angular/core';
import { Sidebar } from './sidebar/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';
import { RouterOutlet } from '@angular/router';
import { NoteService } from '../../core/services/note/note.service';
import { Editor } from "./components/editor/editor";

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Header, RouterOutlet, Editor],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})

export class Dashboard {

  constructor(public noteService: NoteService){}


}
