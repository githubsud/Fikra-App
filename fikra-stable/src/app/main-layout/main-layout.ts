// src/app/main-layout/main-layout.ts
import { Component, ViewChild, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

// Import all necessary Material modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu'; // <-- This was missing

// Import your custom components and services
import { IdeaFormComponent } from '../idea-form/idea-form.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService, User } from '../auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  // This is the complete and correct imports array
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule, // <-- This was missing
    IdeaFormComponent,
    DashboardComponent
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent implements OnInit {
  @ViewChild(DashboardComponent) dashboard!: DashboardComponent;

  // This property will hold the stream of user data from the service
  currentUser$!: Observable<User | null>;

  // Properties for the language switcher
  otherLang: 'en' | 'ar';
  otherLangUrl: string;

  constructor(
    @Inject(LOCALE_ID) public activeLocale: string,
    private authService: AuthService,
    private router: Router
  ) {
    this.otherLang = this.activeLocale.startsWith('ar') ? 'en' : 'ar';
    // Corrected the URL to point to the main layout for the other language
    this.otherLangUrl = `/${this.otherLang}/main`; 
  }

  ngOnInit(): void {
    // Get the user data stream from the service
    this.currentUser$ = this.authService.currentUser;

    // If the user reloads the page, their token is still in localStorage.
    // This logic checks if we need to re-fetch their details.
    if (this.authService.isLoggedIn() && !this.authService.currentUser.value) {
      this.authService.getCurrentUser().subscribe();
    }
  }

  onIdeaSubmitted(): void {
    this.dashboard.loadIdeas();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
