import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="main-header">
      <div class="logo">ProNode</div>
      <div class="user-info" *ngIf="currentUser">
        <span class="status-dot"></span>
        {{ currentUser.displayName }}
      </div>
      <button mat-icon-button (click)="logout()">
        <mat-icon>logout</mat-icon>
      </button>
    </header>
  `,
  styles: [`
    .main-header { 
      height: 60px; 
      background: #112240; 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      padding: 0 20px;
      border-bottom: 1px solid rgba(0, 162, 255, 0.3);
    }
    .status-dot {
      height: 8px;
      width: 8px;
      background-color: #00ff88;
      border-radius: 50%;
      display: inline-block;
      margin-right: 8px;
    }
    .user-info {
      color: white;
    }
  `]
})
export class Header implements OnInit {

  constructor(private router: Router) {}

  currentUser: any = null;

  ngOnInit() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }
  }

  logout() {
  localStorage.removeItem('currentUser');
  this.router.navigate(['/login']);
}
}