// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http'; // <-- Import the full module
import { importProvidersFrom } from '@angular/core';     // <-- Import this function
import { MarkdownModule } from 'ngx-markdown';            // <-- Import the main module

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
    
    // This method reliably imports all providers from the necessary modules
    importProvidersFrom(
      HttpClientModule, 
      MarkdownModule.forRoot()
    ),
  ]
}).catch(err => console.error(err));