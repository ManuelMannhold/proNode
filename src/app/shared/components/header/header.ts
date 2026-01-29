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
      <h1 class="logo">ProNode</h1>
      <div class="user-info" *ngIf="currentUser">
        <span class="status-dot"></span>
        {{ currentUser.displayName }}
      </div>
      <button mat-icon-button (click)="logout()" class="logout-button">
        <mat-icon>logout</mat-icon>
      </button>
    </header>
  `,
  styles: [`
    h1 {
      color: white;
    }
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
    .logout-button {
  
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Segoe UI', sans-serif;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 71, 87, 0.1);
    color: #ff4757;
    border-color: #ff4757;
    box-shadow: 0 0 15px rgba(255, 71, 87, 0.2);
  }
}
  `]
})
export class Header implements OnInit {

  constructor(private router: Router) { }

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