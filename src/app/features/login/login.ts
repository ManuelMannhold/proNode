import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { NgParticlesService, NgxParticlesModule } from "@tsparticles/angular";
import { loadFull } from "tsparticles";
import { RecursivePartial, IOptions } from "@tsparticles/engine";
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { AuthService } from '../../core/services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-login',
  imports: [CommonModule, MatFormField, MatIcon, MatLabel, MatButton, MatInput, NgxParticlesModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private readonly particlesService: NgParticlesService, private auth: Auth) { }

  ngOnInit() {
    this.particlesService.init(async (engine) => {
      await loadFull(engine);
    });
  }

  async particlesLoaded(): Promise<void> {
  }

  async loginWithGoogle() {
    this.isLoading.set(true); // Spinner starten
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set('Google Login abgebrochen oder fehlgeschlagen.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onLogin() {
    // 1. Validierung: Sind die Felder leer?
    if (!this.email || !this.password) {
      this.errorMessage.set('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // 2. Den AuthService aufrufen (den wir vorhin angelegt haben)
      await this.authService.login(this.email(), this.password());

      // 3. Wenn erfolgreich -> Ab ins Dashboard
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      // 4. Fehlerbehandlung (Firebase gibt spezifische Codes zurück)
      console.error('Login-Fehler:', error.code);

      if (error.code === 'auth/invalid-credential') {
        this.errorMessage.set('E-Mail oder Passwort ist falsch.');
      } else if (error.code === 'auth/user-not-found') {
        this.errorMessage.set('Kein Account mit dieser E-Mail gefunden.');
      } else {
        this.errorMessage.set('Ein Fehler ist aufgetreten. Bitte erneut versuchen.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginAsGuest() {
    this.isLoading.set(true);
    try {
      await this.authService.loginAsGuest();
      // Wenn das klappt, hat der authGuard nun einen echten User im Stream
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set('Gast-Zugang konnte nicht aktiviert werden.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public particlesOptions: RecursivePartial<IOptions> = {
    background: {
      color: { value: "transparent" }
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab"
        },
        resize: {
          enable: true
        }
      },
      modes: {
        grab: {
          distance: 200,
          links: {
            opacity: 0.5
          }
        }
      }
    },
    particles: {
      color: { value: "#00a2ff" },
      links: {
        color: "#00a2ff",
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none", // Nutze den String direkt oder MoveDirection.none
        outModes: {
          default: "out" // Nutze den String direkt oder OutMode.out
        }
      },
      number: {
        value: 80
      },
      opacity: {
        value: 0.5
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 3 }
      }
    }
  };
}