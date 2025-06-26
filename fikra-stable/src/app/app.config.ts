// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

// Import all components for routing using the correct file paths
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register.component';
import { MainLayoutComponent } from './main-layout/main-layout';
import { StatsDashboardComponent } from './stats-dashboard/stats-dashboard.component';

// Import our new interceptor
import { authTokenInterceptor } from './auth/auth-token.interceptor';

// Define the application's routes
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'main', component: MainLayoutComponent },
  { path: 'stats', component: StatsDashboardComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    importProvidersFrom(
      MarkdownModule.forRoot(),
      RouterModule.forRoot(routes)
    ),
  ]
};