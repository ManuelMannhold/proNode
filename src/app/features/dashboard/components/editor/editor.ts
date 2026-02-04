import { Component, OnInit, signal, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NoteService } from '../../../../core/services/note/note.service';
import { Database, ref, set } from '@angular/fire/database';
import { Welcome } from '../welcome/welcome';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule, Welcome],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor implements OnInit, OnDestroy {
  deleteNote() {
    throw new Error('Method not implemented.');
  }
  shareNote() {
    throw new Error('Method not implemented.');
  }

  public isTitleInvalid = signal(false);
  public noteService = inject(NoteService);
  public selectedNote = this.noteService.selectedNote;
  private route = inject(ActivatedRoute);
  private db = inject(Database);

  // UI States
  noteTitle = signal('');
  noteContent = signal('');
  saveStatus = signal('Alle Änderungen gespeichert');

  private contentUpdate$ = new Subject<string>();
  private autoSaveSubscription?: Subscription;

  constructor() {
    effect(() => {
      const current = this.selectedNote();
      if (current) {
        this.noteTitle.set(current.title || '');
        this.noteContent.set(current.content || '');
        this.isTitleInvalid.set(false);
      }
    });
    // 1. Auto-Save Setup
    this.autoSaveSubscription = this.contentUpdate$.pipe(
      debounceTime(700),
      distinctUntilChanged()
    ).subscribe(content => {
      this.performAutoSave(content);
    });

    effect(() => {
      const note = this.noteService.selectedNote();
      if (note) {
        this.noteTitle.set(note.title);
        this.noteContent.set(note.content || '');
        this.saveStatus.set('Bereit');
      }
    });
  }

  async deleteCurrentNote() {
    const current = this.selectedNote();
    if (current && confirm('Diese Notiz wirklich löschen?')) {
      await this.noteService.deleteNote(current.parentId, current.id);
    }
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
      this.noteService.isSaving.set(true);
      this.saveStatus.set('Speichere...');
      try {
        await this.noteService.updateNoteContent(
          currentNote.parentId,
          currentNote.id,
          content
        );
        this.saveStatus.set('In Echtzeit gespeichert');
        setTimeout(() => {
          this.noteService.isSaving.set(false);
        }, 1000);
      } catch (error) {
        console.error('Auto-Save fehlgeschlagen:', error);
        this.saveStatus.set('Fehler beim Speichern!');
      }
    }
  }

  async updateTitle(newTitle: string) {
    this.noteTitle.set(newTitle);

    if (!newTitle || newTitle.trim() === '') {
      this.isTitleInvalid.set(true);
      return;
    }

    this.isTitleInvalid.set(false);
    const currentNote = this.noteService.selectedNote();

    if (currentNote) {
      this.noteService.isSaving.set(true);
      const titleRef = ref(this.db, `folders/${currentNote.parentId}/notes/${currentNote.id}/title`);

      try {
        await set(titleRef, newTitle);
        setTimeout(() => this.noteService.isSaving.set(false), 1000);
      } catch (error) {
        console.error(error);
        this.noteService.isSaving.set(false);
      }
    }
  }

  onTitleBlur() {
    const currentTitle = this.noteTitle();

    // Wenn der Titel leer ist oder nur aus Leerzeichen besteht
    if (!currentTitle || currentTitle.trim() === '') {
      const fallbackTitle = 'Unbenannte Notiz';

      this.noteTitle.set(fallbackTitle);
      this.isTitleInvalid.set(false); // Roten Rahmen entfernen

      // Direkt den Fallback-Titel in der DB speichern
      this.updateTitle(fallbackTitle);
    }
  }

  async saveNote() {
    await this.performAutoSave(this.noteContent());
  }

  ngOnDestroy() {
    this.autoSaveSubscription?.unsubscribe();
  }
}