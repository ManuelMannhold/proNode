import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // authState ist ein Observable von Firebase, das den aktuellen User liefert
  return authState(auth).pipe(
    take(1), // Wir nehmen nur den aktuellen Status und schließen den Stream
    map(user => {
      if (user) {
        return true; // User ist eingeloggt -> Zutritt gewährt
      } else {
        // User ist nicht eingeloggt -> Umleitung zur Login-Seite
        return router.parseUrl('/login'); 
      }
    })
  );
};