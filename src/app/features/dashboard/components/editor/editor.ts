import { Component, OnInit, signal, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NoteService } from '../../../../core/services/note/note.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor implements OnInit, OnDestroy {
  // Services
  public noteService = inject(NoteService);
  private route = inject(ActivatedRoute);

  // UI States
  noteTitle = signal('');
  noteContent = signal('');
  saveStatus = signal('Alle Änderungen gespeichert');

  private contentUpdate$ = new Subject<string>();
  private autoSaveSubscription?: Subscription;

  constructor() {
    // 1. Auto-Save Setup
    this.autoSaveSubscription = this.contentUpdate$.pipe(
      debounceTime(700),
      distinctUntilChanged()
    ).subscribe(content => {
      this.performAutoSave(content);
    });

    // 2. Effekt MUSS im Constructor stehen (Injection Context)
    effect(() => {
      const note = this.noteService.selectedNote();
      if (note) {
        // Wir füllen den Editor, sobald sich im Service die Auswahl ändert
        this.noteTitle.set(note.title);
        this.noteContent.set(note.content || '');
        this.saveStatus.set('Bereit');
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadNoteData(id);
      }
    });
  }

  private loadNoteData(id: string) {
    if (id === 'welcome') {
      this.noteTitle.set('Willkommen bei ProNode');
      this.noteContent.set('Wähle eine Notiz aus der Sidebar aus oder erstelle eine neue.');
      return;
    }

    const note = this.noteService.getNoteById(id);

    if (note) {
      this.noteService.selectNote(note);
      this.noteTitle.set(note.title);
      this.noteContent.set(note.content || '');
      this.saveStatus.set('Bereit zum Schreiben');
    } else {
      this.saveStatus.set('Notiz wird geladen...');
      // Kleiner Trick: Da Firebase asynchron ist, versuchen wir es kurz verzögert nochmal, 
      // falls die Notiz beim ersten Mal noch nicht im Signal war
      setTimeout(() => {
        const retryNote = this.noteService.getNoteById(id);
        if (retryNote) this.noteService.selectNote(retryNote);
      }, 500);
    }
  }

  onContentChange(newContent: string) {
    this.noteContent.set(newContent);
    this.contentUpdate$.next(newContent);
  }

  private async performAutoSave(content: string) {
    const currentNote = this.noteService.selectedNote();
    if (currentNote) {
      this.saveStatus.set('Speichere...');
      try {
        await this.noteService.updateNoteContent(
          currentNote.parentId,
          currentNote.id,
          content
        );
        this.saveStatus.set('In Echtzeit gespeichert');
      } catch (error) {
        console.error('Auto-Save fehlgeschlagen:', error);
        this.saveStatus.set('Fehler beim Speichern!');
      }
    }
  }

  async saveNote() {
    await this.performAutoSave(this.noteContent());
  }

  ngOnDestroy() {
    this.autoSaveSubscription?.unsubscribe();
  }
}