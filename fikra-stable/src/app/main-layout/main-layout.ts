// src/app/main-layout/main-layout.ts
import { Component, ViewChild, Inject, LOCALE_ID } from '@angular/core'; // <-- Import Inject & LOCALE_ID
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar'; // <-- Use MatToolbarModule for standalone
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // <-- Import Button Module

import { IdeaFormComponent } from '../idea-form/idea-form.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule, // Use MatToolbarModule
    MatIconModule,
    MatButtonModule, // Add Button Module
    IdeaFormComponent,
    DashboardComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent {
  @ViewChild(DashboardComponent) dashboard!: DashboardComponent;

  // NEW PROPERTIES FOR LANGUAGE SWITCHING
  otherLang: 'en' | 'ar';
  otherLangUrl: string;

  constructor(@Inject(LOCALE_ID) public activeLocale: string) {
    // Determine the other language
    this.otherLang = this.activeLocale === 'ar' ? 'en' : 'ar';

    // Build the URL for the other language
    // In development, Angular serves languages from subdirectories
    this.otherLangUrl = `/<span class="math-inline">\{this\.otherLang\}</span>{window.location.pathname}`;
  }

  onIdeaSubmitted(): void {
    console.log('Main layout caught the event! Refreshing dashboard...');
    this.dashboard.loadIdeas();
  }
}