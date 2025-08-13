import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

const firebaseConfig = {
  apiKey: "AIzaSyCDxxfSgyugqQUE_QULoNXDe6G--PLasi4",
  authDomain: "alitas-app-63d93.firebaseapp.com",
  projectId: "alitas-app-63d93",
  storageBucket: "alitas-app-63d93.firebasestorage.app",
  messagingSenderId: "100278779328",
  appId: "1:100278779328:web:57c074d8853099799b9c25",
  measurementId: "G-Y91HB61PBV"
};

initializeApp(firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Inicialización de Firebase

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideHttpClient()
  ]
};
