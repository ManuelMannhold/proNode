import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Editor } from './features/dashboard/components/editor/editor';
import { Welcome } from './features/dashboard/components/welcome/welcome';
import { authGuard } from './core/guards/auth.guard'; // Importiere deinen neuen Guard

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard], // Der Türsteher bewacht jetzt den gesamten Dashboard-Bereich
    children: [
      { path: '', component: Welcome },
      { path: 'note/:id', component: Editor }
    ]
  },
  { path: '**', redirectTo: 'login' }
];