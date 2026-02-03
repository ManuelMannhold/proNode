import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Editor } from './features/dashboard/components/editor/editor';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'note/welcome', pathMatch: 'full' },
      { path: 'note/:id', component: Editor }
    ]
  },
  { path: '**', redirectTo: 'login' }
];