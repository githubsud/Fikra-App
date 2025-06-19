// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { RouterModule, Routes } from '@angular/router'; // <-- Import RouterModule

// Import your components for routing
import { LoginComponent } from './login/login';
import { MainLayoutComponent } from './main-layout/main-layout';

// Define the application's routes
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainLayoutComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    importProvidersFrom(
      HttpClientModule,
      MarkdownModule.forRoot(),
      // This is the alternative, robust way to provide routes
      RouterModule.forRoot(routes) 
    ),
  ]
};