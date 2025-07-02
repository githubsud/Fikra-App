// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

// Import all components and the new guard with the correct file paths
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register.component';
import { MainLayoutComponent } from './main-layout/main-layout';
import { StatsDashboardComponent } from './stats-dashboard/stats-dashboard.component';
import { authGuard } from './auth/auth.guard';
import { authTokenInterceptor } from './auth/auth-token.interceptor'; // <-- This was the missing import

// Define the application's routes
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Apply the guard to the protected routes
  { 
    path: 'main', 
    component: MainLayoutComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'stats', 
    component: StatsDashboardComponent,
    canActivate: [authGuard]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    // Provide the HttpClient WITH the interceptor
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    importProvidersFrom(
      MarkdownModule.forRoot(),
      RouterModule.forRoot(routes)
    ),
  ]
};
