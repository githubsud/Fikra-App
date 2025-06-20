// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

// Import the components for routing
import { LoginComponent } from './login/login';
import { MainLayoutComponent } from './main-layout/main-layout';
import { StatsDashboardComponent } from './stats-dashboard/stats-dashboard.component'; // <-- 1. IMPORT new component

// Define the application's routes
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainLayoutComponent },
  { path: 'stats', component: StatsDashboardComponent }, // <-- 2. ADD the new route
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    importProvidersFrom(
      HttpClientModule,
      MarkdownModule.forRoot(),
      RouterModule.forRoot(routes)
    ),
  ]
};