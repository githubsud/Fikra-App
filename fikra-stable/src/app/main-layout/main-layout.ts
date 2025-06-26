// src/app/main-layout/main-layout.ts
import { Component, ViewChild, Inject, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// Import Material components
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Import your custom components and services
import { IdeaFormComponent } from '../idea-form/idea-form.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  // THIS IS THE CORRECT, COMPLETE IMPORTS ARRAY:
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    IdeaFormComponent,
    DashboardComponent
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent {
  @ViewChild(DashboardComponent) dashboard!: DashboardComponent;

  otherLang: 'en' | 'ar';
  otherLangUrl: string;

  // Inject AuthService and Router
  constructor(
    @Inject(LOCALE_ID) public activeLocale: string,
    private authService: AuthService,
    private router: Router
  ) {
    this.otherLang = this.activeLocale.startsWith('ar') ? 'en' : 'ar';
    this.otherLangUrl = `/${this.otherLang}/main`;
  }

  onIdeaSubmitted(): void {
    console.log('Main layout caught the event! Refreshing dashboard...');
    this.dashboard.loadIdeas();
  }

  // Logout method
  logout(): void {
    this.authService.logout(); // Clears the token from storage
    this.router.navigate(['/login']); // Redirects to the login page
  }
}