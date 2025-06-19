// src/app/main-layout/main-layout.ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import Material components
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';

// Import your custom components
import { IdeaFormComponent } from '../idea-form/idea-form.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar,
    MatIcon,
    IdeaFormComponent,
    DashboardComponent,
  ],
  templateUrl: './main-layout.html', // <-- Corrected path
  styleUrls: ['./main-layout.scss']   // <-- Corrected path
})
export class MainLayoutComponent {
  @ViewChild(DashboardComponent) dashboard!: DashboardComponent;

  onIdeaSubmitted(): void {
    console.log('Main layout caught the event! Refreshing dashboard...');
    this.dashboard.loadIdeas();
  }
}