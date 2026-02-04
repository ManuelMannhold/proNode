import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { NgParticlesService, NgxParticlesModule } from "@tsparticles/angular";
import { loadFull } from "tsparticles";
import { RecursivePartial, IOptions } from "@tsparticles/engine";
import { Auth, signInAnonymously } from '@angular/fire/auth';


@Component({
  selector: 'app-login',
  imports: [CommonModule, MatFormField, MatIcon, MatLabel, MatButton, MatInput, NgxParticlesModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  constructor(private router: Router, private readonly particlesService: NgParticlesService, private auth: Auth) { }

  ngOnInit() {
    this.particlesService.init(async (engine) => {
      await loadFull(engine);
    });
  }

  async particlesLoaded(): Promise<void> {
}

async loginAsGuest() {
  console.log("Simuliere Gast-Login (Bypass)...");
  
  const fakeUser = {
    uid: 'guest-' + Math.random().toString(36).substr(2, 9),
    displayName: 'Gast',
    isAnonymous: true
  };
  
  localStorage.setItem('currentUser', JSON.stringify(fakeUser));

  this.router.navigate(['/dashboard']).then(success => {
    if (success) {
      console.log('Navigation zum Dashboard erfolgreich!');
    } else {
      console.error('Navigation fehlgeschlagen!');
    }
  });
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