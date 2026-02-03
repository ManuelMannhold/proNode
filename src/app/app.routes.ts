import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Editor } from './features/dashboard/components/editor/editor';
import { Welcome } from './features/dashboard/components/welcome/welcome';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: '', component: Welcome },
      { path: 'note/:id', component: Editor }
    ]
  },
  { path: '**', redirectTo: 'login' }
];