// app.config.ts (o donde tengas definido appConfig)
import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withDebugTracing, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { environment } from './enviroments/enviroment';  // asumo que aquí tienes { production, firebase: { apiKey, authDomain, … } }

export const appConfig: ApplicationConfig = {
  providers: [

    provideHttpClient(),
    
    provideZoneChangeDetection({ eventCoalescing: true }),
    // 🔹 Aquí ajustamos el router:
    provideRouter(
      routes,
      // 1️⃣ Espera a que terminen los redirect iniciales antes de montar la app
      withEnabledBlockingInitialNavigation(),
      // 2️⃣ Habilita el scroll en memoria para restaurar posiciones
      //withDebugTracing(),
      // 3️⃣ Configura el router para que maneje el scroll y anclas
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // restoración al volver atrás, top en adelante
        anchorScrolling: 'enabled'             // habilita anclas si hay fragmentos
      })
    ),
    provideIonicAngular(),

    // 1) inicializa la App con SOLO el objeto firebase:
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // 2) luego inyecta Auth y Firestore:
    provideAuth(() => {
      const auth = getAuth();
      auth.useDeviceLanguage();
      return auth;
    }),
    provideFirestore(() => getFirestore()),
  ]
};
