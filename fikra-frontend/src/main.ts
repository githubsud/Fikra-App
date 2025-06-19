// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), // Needed for Angular Material animations
    provideHttpClient()  // Needed for making API calls
  ]
}).catch(err => console.error(err));