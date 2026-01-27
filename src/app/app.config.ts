import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyAN8aeNKONIeEMa9XnjEVq8wGGWVNmX2bA",
  authDomain: "pronode-664cc.firebaseapp.com",
  databaseURL: "https://pronode-664cc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pronode-664cc",
  storageBucket: "pronode-664cc.firebasestorage.app",
  messagingSenderId: "233962608733",
  appId: "1:233962608733:web:759ff555cfd58465ec95b4"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()), // Datenbank-Provider
  ]
};
