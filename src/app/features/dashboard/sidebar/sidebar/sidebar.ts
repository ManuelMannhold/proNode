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
import { Auth, signOut, user } from '@angular/fire/auth';
import { MatDividerModule } from '@angular/material/divider';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, CommonModule, CdkDropList, CdkDrag, CdkDragHandle, MatMenuModule, DragDropModule,
    MatIconModule,
    MatButtonModule, MatTooltipModule, MatRippleModule, MatMenuModule,
    MatDividerModule,
    MatButtonModule],
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
  private auth = inject(Auth);

  expandedFolderIds = signal<Set<string>>(new Set());
  folders = this.noteService.folders;
  selectedFolderId = signal<string | null>(null);
  isExpanded = this.noteService.isSidebarExpanded;
  isMobile = signal(window.innerWidth < 768);
  currentUser = toSignal(user(this.auth));

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

  currentUser$ = user(this.auth);

  moveNoteTo(noteId: string, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newFolderId = selectElement.value;

    if (newFolderId) {
      this.noteService.moveNote(noteId, newFolderId);
    }
  }

  /**
   * Derives a display name from user object properties (displayName or email).
   * @param {any} user - The current user object.
   * @returns {string} The formatted name, 'Gast', or 'User'.
   */
  getUserDisplayName(user: any): string {
    if (!user) return 'Gast';
    if (user.displayName) return user.displayName;
    if (user.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
    }
    return 'User';
  }

  /**
   * Displays a temporary notification regarding the availability of settings.
   */
  goToSettings() {
    this.snackBar.open('Einstellungen folgen bald...', 'OK', { duration: 2000 });
  }

  /**
   * Clears local session data, signs out from Firebase, and redirects to login.
   * @returns {Promise<void>}
   */
  async logout() {
    localStorage.removeItem('currentUser');
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  /**
   * Toggles the global sidebar expansion state via the note service.
   */
  toggleSidebar() {
    this.noteService.toggleSidebar();
  }

  /**
   * Collapses the sidebar if the viewport width is below the mobile threshold.
   * @private
   */
  private closeSidebarOnMobile() {
    if (window.innerWidth < 768) {
      this.isExpanded.set(false);
    }
  }

  /**
   * Manually sets the sidebar expansion state to false.
   */
  closeSidebar() {
    this.isExpanded.set(false);
  }

  /**
   * Toggles the expansion state of a specific folder in the UI.
   * @param {any} folder - The folder object to toggle.
   */
  toggleFolder(folder: any) {
    const currentSet = new Set(this.expandedFolderIds());
    if (currentSet.has(folder.id)) {
      currentSet.delete(folder.id);
    } else {
      currentSet.add(folder.id);
    }
    this.expandedFolderIds.set(currentSet);
  }

  /**
   * Checks if a specific folder is currently expanded in the sidebar.
   * @param {string} folderId - The ID of the folder.
   * @returns {boolean}
   */
  isFolderExpanded(folderId: string): boolean {
    return this.expandedFolderIds().has(folderId);
  }

  /**
   * Opens the sidebar on mobile and creates a new temporary folder stub.
   */
  addFolder() {
    if (window.innerWidth < 768) {
      this.isExpanded.set(true);
    }
    const newId = Date.now().toString();
    this.noteService.addFolderStub(newId);
  }

  /**
   * Persists a folder name change or removes the stub if the name is empty.
   * @param {string} folderId - The ID of the folder.
   * @param {any} event - The input change event.
   */
  saveName(folderId: string, event: any) {
    const newName = event.target.value.trim();
    if (newName) {
      this.noteService.saveFolder(folderId, newName);
      this.noteService.setEditing(folderId, false);
    } else {
      this.noteService.removeFolderStub(folderId);
    }
  }

  /**
   * Sets the active folder and collapses the sidebar on mobile devices.
   * @param {string} folderId - The ID of the selected folder.
   */
  selectFolder(folderId: string) {
    this.selectedFolderId.set(folderId);
    if (this.isMobile()) {
      this.isExpanded.set(false);
    }
  }

  /**
   * Performs an optimistic deletion of a folder with an undo option via Snackbar.
   * If the undo action is not triggered within 5 seconds, the folder is permanently removed from the database.
   * @param {string} id - The ID of the folder to delete.
   */
  deleteFolder(id: string) {
    const folderToDelete = this.folders().find(f => f.id === id);
    if (!folderToDelete) return;
    const previousFolders = [...this.folders()];
    this.noteService.updateLocalOrder(previousFolders.filter(f => f.id !== id));

    const snackBarRef = this.snackBar.open(
      `Ordner "${folderToDelete.name}" gelöscht`,
      'RÜCKGÄNGIG',
      { duration: 2500, panelClass: ['dark-snackbar', 'fast-snackbar'] }
    );

    snackBarRef.onAction().subscribe(() => {
      this.noteService.updateLocalOrder(previousFolders);
    });

    snackBarRef.afterDismissed().subscribe((info) => {
      if (!info.dismissedByAction) {
        this.noteService.deleteFolder(id);
      }
    });
  }

  /**
   * Updates the selected note in the global service state.
   * @param {Note} note - The clicked note object.
   */
  onNoteClick(note: Note) {
    this.noteService.selectNote(note);
  }

  /**
   * Opens a dialog to create a new note and navigates to it upon completion.
   */
  openCreateNoteDialog() {
    const DIALOGREF = this.dialog.open(CreateNoteDialog, {
      width: '450px',
      panelClass: 'custom-glass-dialog'
    });

    DIALOGREF.afterClosed().subscribe(result => {
      if (result) {
        const mockId = Math.random().toString(36).substring(7);
        this.router.navigate(['/dashboard/note', mockId]);
      }
    });
  }

  /**
   * Handles drag-and-drop reordering of folders and persists the new order.
   * @param {CdkDragDrop<Folder[]>} event - The drag-and-drop event data.
   */
  drop(event: CdkDragDrop<Folder[]>) {
    const currentFolders = [...this.folders()];
    moveItemInArray(currentFolders, event.previousIndex, event.currentIndex);
    this.noteService.updateLocalOrder(currentFolders);
    this.noteService.updateFolderPositions(currentFolders);
  }

  /**
   * Deletes a note and provides a snackbar notification with an undo option.
   * @param {MouseEvent} event - The click event to stop propagation.
   * @param {any} note - The note object to delete.
   * @returns {Promise<void>}
   */
  async onDeleteNote(event: MouseEvent, note: any) {
    event.stopPropagation();
    const deletedNote = note;
    await this.noteService.deleteNote(note.id);

    const snack = this.snackBar.open(`Notiz "${note.title}" gelöscht`, 'RÜCKGÄNGIG', {
      duration: 2500,
      panelClass: ['dark-snackbar']
    });

    snack.onAction().subscribe(async () => {
    });
  }

  /**
   * Selects a note, navigates to the editor, and closes the sidebar.
   * @param {any} note - The note object to select.
   */
  selectNote(note: any) {
    this.noteService.selectedNote.set({ ...note });
    this.router.navigate(['/dashboard/note', note.id]);
    if (this.isExpanded()) {
      this.isExpanded.set(false);
    }
  }

  /**
   * Opens a legal information dialog (Impressum or Datenschutz).
   * @param {'impressum' | 'datenschutz'} type - The type of legal content to display.
   */
  openLegal(type: 'impressum' | 'datenschutz') {
    this.dialog.open(LegalDialog, {
      data: { type },
      width: '90%',
      maxWidth: '600px',
      panelClass: 'custom-glass-dialog',
      autoFocus: false
    });
  }
}
