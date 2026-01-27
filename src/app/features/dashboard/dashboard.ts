import { Component } from '@angular/core';
import { Sidebar } from './sidebar/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

}
