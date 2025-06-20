// src/app/main-layout/main-layout.ts
import { Component, ViewChild, Inject, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Import Material components
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Import your custom components
import { IdeaFormComponent } from '../idea-form/idea-form.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    IdeaFormComponent,
    DashboardComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent {
  @ViewChild(DashboardComponent) dashboard!: DashboardComponent;

  // Properties for the language switcher
  otherLang: 'en' | 'ar';
  otherLangUrl: string;

  // Inject LOCALE_ID to know the current language
  constructor(@Inject(LOCALE_ID) public activeLocale: string) {
    // Determine the other language
    this.otherLang = this.activeLocale.startsWith('ar') ? 'en' : 'ar';
    
    // Build the URL for the other language version of the site
    this.otherLangUrl = `/${this.otherLang}/main`;
  }

  onIdeaSubmitted(): void {
    console.log('Main layout caught the event! Refreshing dashboard...');
    this.dashboard.loadIdeas();
  }
}