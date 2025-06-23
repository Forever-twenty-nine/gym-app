import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
// Uncomment the following imports if you are using service worker and Firebase
//import { provideServiceWorker } from '@angular/service-worker';
//import { provideFirestore, getFirestore } from '@angular/fire/firestore';
//import { environment } from '../environments/environment';
//import { initializeApp, provideFirebaseApp } from '@angular/fire/app';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // provideServiceWorker('ngsw-worker.js', {
    //   enabled: !isDevMode(),
    //   registrationStrategy: 'registerWhenStable:30000'
    // }),
    //provideFirebaseApp(() => initializeApp(environment.firebase)),
    //provideFirestore(() => getFirestore()),
    ]
};
