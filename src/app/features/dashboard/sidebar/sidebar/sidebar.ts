import { Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NoteService } from '../../../../core/services/note/note.service';
import { Folder, Note } from '../../../../core/models/note/note.model';
import { CreateNoteDialog } from '../../components/create-note-dialog/create-note-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs/operators';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LegalDialog } from '../../components/legal-dialog/legal-dialog';
import { DragDropModule, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, CommonModule, CdkDropList, CdkDrag, CdkDragHandle, MatMenuModule, DragDropModule,
    MatIconModule,
    MatButtonModule, MatTooltipModule, MatRippleModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  animations: [
    trigger('folderAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})

export class Sidebar {
  public noteService = inject(NoteService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  public selectedNote = this.noteService.selectedNote;
  private snackBar = inject(MatSnackBar);
  expandedFolderIds = signal<Set<string>>(new Set());

  folders = this.noteService.folders;
  selectedFolderId = signal<string | null>(null);
  isExpanded = signal(false);
  isMobile = signal(window.innerWidth < 768);

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.isMobile.set(window.innerWidth < 768);
  }

  @ViewChild('nameInput') set nameInput(element: ElementRef<HTMLInputElement>) {
    if (element) {
      setTimeout(() => {
        element.nativeElement.focus();
        element.nativeElement.select();
      }, 0);
    }
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeSidebarOnMobile();
    });
  }

  toggleSidebar() {
    this.isExpanded.update(v => !v);
  }

  private closeSidebarOnMobile() {
    if (window.innerWidth < 768) {
      this.isExpanded.set(false);
    }
  }

  closeSidebar() {
    this.isExpanded.set(false);
  }

  toggleFolder(folder: any) {
    const currentSet = new Set(this.expandedFolderIds());
    if (currentSet.has(folder.id)) {
      currentSet.delete(folder.id);
    } else {
      currentSet.add(folder.id);
    }
    this.expandedFolderIds.set(currentSet);
  }

  isFolderExpanded(folderId: string): boolean {
    return this.expandedFolderIds().has(folderId);
  }

  addFolder() {
    if (window.innerWidth < 768) {
      this.isExpanded.set(true);
    }
    const newId = Date.now().toString();
    this.noteService.addFolderStub(newId);
  }

  saveName(folderId: string, event: any) {
    const newName = event.target.value.trim();
    if (newName) {
      this.noteService.saveFolder(folderId, newName);
      this.noteService.setEditing(folderId, false);
    } else {
      this.noteService.removeFolderStub(folderId);
    }
  }

  selectFolder(folderId: string) {
    this.selectedFolderId.set(folderId);
    if (this.isMobile()) {
      this.isExpanded.set(false);
    }
  }

  deleteFolder(id: string) {
    if (confirm('Möchtest du diesen Ordner wirklich löschen?')) {
      this.noteService.deleteFolder(id);
    }
  }

  // --- Notiz Funktionen ---

  onNoteClick(note: Note) {
    this.noteService.selectNote(note);
  }

  openCreateNoteDialog() {
    const DIALOGREF = this.dialog.open(CreateNoteDialog, {
      width: '450px',
      panelClass: 'custom-glass-dialog'
    });

    DIALOGREF.afterClosed().subscribe(result => {
      if (result) {
        // 1. Hier würdest du normalerweise deinen Service aufrufen:
        // this.noteService.createNote(result).subscribe(newNote => { ... });

        // 2. Navigation: Wir schicken den User zum Editor mit der ID der neuen Notiz
        // Für den Test nehmen wir eine fiktive ID:
        const mockId = Math.random().toString(36).substring(7);
        this.router.navigate(['/dashboard/note', mockId]);
      }
    });
  }

  drop(event: CdkDragDrop<Folder[]>) {
    const currentFolders = [...this.folders()];
    moveItemInArray(currentFolders, event.previousIndex, event.currentIndex);
    this.noteService.updateLocalOrder(currentFolders);
    this.noteService.updateFolderPositions(currentFolders);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  async onDeleteNote(event: MouseEvent, note: any) {
    event.stopPropagation();

    // 1. Notiz aus der UI "entfernen" (lokal speichern für Notfall)
    const deletedNote = note;
    await this.noteService.deleteNote(note.parentId, note.id);

    // 2. Schicke Snackbar anzeigen
    const snack = this.snackBar.open(`Notiz "${note.title}" gelöscht`, 'RÜCKGÄNGIG', {
      duration: 5000,
      panelClass: ['dark-snackbar']
    });

    // 3. Logik für das Rückgängig machen
    snack.onAction().subscribe(async () => {
      // Hier würdest du die Notiz einfach wieder mit set() in Firebase schreiben
      // await this.noteService.restoreNote(deletedNote);
      console.log('Wiederherstellung angefordert');
    });
  }

  selectNote(note: any) {
    this.noteService.selectedNote.set({ ...note });
    this.router.navigate(['/dashboard/note', note.id]);
    if (this.isExpanded()) {
      this.isExpanded.set(false);
    }
  }

  openLegal(type: 'impressum' | 'datenschutz') {
    this.dialog.open(LegalDialog, {
      data: { type },
      width: '90%',
      maxWidth: '600px',
      panelClass: 'custom-glass-dialog', // Nutze deine vorhandene Dialog-Klasse
      autoFocus: false
    });
  }
}
