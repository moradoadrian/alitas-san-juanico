// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideFirestore } from '@angular/fire/firestore';
import { initializeFirestore } from 'firebase/firestore'; // ← Ojo: desde firebase/firestore
import { provideStorage, getStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),

    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Forzar long-polling para evitar bloqueos de streaming por adblock/proxy
    provideFirestore(() => {
      const app = getApp();
      return initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        // experimentalForceLongPolling: true, // si el auto no basta, descomenta este
        // useFetchStreams: false,             // algunos proxies rompen fetch streams
      });
    }),

    provideStorage(() => getStorage()),
  ]
};
