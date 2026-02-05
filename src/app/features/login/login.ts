import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { NgParticlesService, NgxParticlesModule } from "@tsparticles/angular";
import { loadFull } from "tsparticles";
import { RecursivePartial, IOptions } from "@tsparticles/engine";
import { AuthService } from '../../core/services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  imports: [CommonModule, MatFormField, MatIcon, MatLabel, MatButton, MatInput, NgxParticlesModule, FormsModule, MatProgressSpinnerModule, ReactiveFormsModule, MatError],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  authForm!: FormGroup
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  isRegisterMode = false;

  constructor(private readonly particlesService: NgParticlesService, private auth: Auth, private fb: FormBuilder) { }

  ngOnInit() {
    this.particlesService.init(async (engine) => {
      await loadFull(engine);
    });
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['']
    });
    this.authForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set('');
      }
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  async onSubmit() {
    if (this.authForm.invalid) return;

    const { email, password, confirmPassword } = this.authForm.value;
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      if (this.isRegisterMode) {
        if (password !== confirmPassword) {
          this.snackBar.open('Passwörter stimmen nicht überein!', 'OK', {
            duration: 3000,
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar'] // Damit kannst du es im CSS rot färben
          });
          return;
        }
        await createUserWithEmailAndPassword(this.auth, email, password);
        this.snackBar.open('Konto erfolgreich erstellt! Willkommen.', 'Super', {
          duration: 4000,
          panelClass: ['success-snackbar'],
          verticalPosition: 'bottom'
        });
        this.router.navigate(['/dashboard']);
      } else {
        await signInWithEmailAndPassword(this.auth, email, password);
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.handleAuthError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private handleAuthError(error: any) {
    console.error('Firebase Error Code:', error.code);

    switch (error.code) {
      case 'auth/invalid-credential':
        this.errorMessage.set('E-Mail oder Passwort ist falsch.');
        break;
      case 'auth/user-not-found':
        this.errorMessage.set('Kein Account mit dieser E-Mail gefunden.');
        break;
      case 'auth/wrong-password':
        this.errorMessage.set('Das eingegebene Passwort ist nicht korrekt.');
        break;
      case 'auth/email-already-in-use':
        this.errorMessage.set('Diese E-Mail wird bereits verwendet.');
        break;
      default:
        this.errorMessage.set('Ein Fehler ist aufgetreten. Bitte versuche es nochmal.');
    }
    setTimeout(() => {
      this.errorMessage.set('');
    }, 5000);
  }

  toggleRegisterMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage.set('');
    this.authForm.get('email')?.reset();
    this.authForm.get('password')?.reset();
    this.authForm.get('confirmPassword')?.reset();
    const confirmControl = this.authForm.get('confirmPassword');

    if (this.isRegisterMode) {
      confirmControl?.setValidators([Validators.required]);
    } else {
      confirmControl?.clearValidators();
    }
    confirmControl?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  async particlesLoaded(): Promise<void> {
  }

  async loginWithGoogle() {
    this.isLoading.set(true); // Spinner starten
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.snackBar.open('Google Login abgebrochen!', 'OK', {
        duration: 3000,
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
      return;
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