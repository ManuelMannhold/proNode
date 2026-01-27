import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, RouterOutlet, MatFormField, MatIcon, MatLabel],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  constructor(private router: Router) {}
}
