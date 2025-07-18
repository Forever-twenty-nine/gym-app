// app.config.ts (o donde tengas definido appConfig)
import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { environment } from './enviroments/enviroment';  // asumo que aquí tienes { production, firebase: { apiKey, authDomain, … } }

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular(),

    // 1) inicializa la App con SOLO el objeto firebase:
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // 2) luego inyecta Auth y Firestore:
    provideAuth(() => {
      const auth = getAuth();
      auth.useDeviceLanguage();    // opcional, para usar el idioma del navegador
      return auth;
    }),
    provideFirestore(() => getFirestore()),

    // 3) service worker, etc.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
};
