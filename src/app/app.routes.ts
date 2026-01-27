import { Routes } from '@angular/router';
import { Login } from './features/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  //{ path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: 'login' }
];