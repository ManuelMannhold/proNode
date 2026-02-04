import { inject, Injectable } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
  signInAnonymously
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Ein Observable, das uns immer den aktuellen Firebase-User liefert
  // Nützlich für Header-Anzeigen oder Profilbilder
  user$ = authState(this.auth);

  /**
   * Meldet einen bestehenden User mit E-Mail und Passwort an
   */
  async login(email: string, pass: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, pass);
      return credential;
    } catch (error) {
      throw error; // Fehler an die Komponente weitergeben (z.B. für Fehlermeldungen)
    }
  }

  async loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(this.auth, provider);
    return result;
  } catch (error) {
    console.error("Google Login Fehler:", error);
    throw error;
  }
}

async loginAsGuest() {
    try {
      return await signInAnonymously(this.auth);
    } catch (error) {
      console.error("Firebase Gast-Login fehlgeschlagen:", error);
      throw error;
    }
  }

  /**
   * Erstellt einen neuen Account
   */
  async register(email: string, pass: string) {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, pass);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Loggt den User aus und leitet ihn zum Login zurück
   */
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}