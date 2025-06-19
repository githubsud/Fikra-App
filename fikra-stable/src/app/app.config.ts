import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

import { LoginComponent } from './login/login';
import { MainLayoutComponent } from './main-layout/main-layout';

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
      RouterModule.forRoot(routes)
    ),
  ]
};