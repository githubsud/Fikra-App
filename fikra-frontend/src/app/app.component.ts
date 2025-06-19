// src/app/app.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

// --- Import our custom standalone components ---
import { IdeaFormComponent } from './idea-form/idea-form';
import { DashboardComponent } from './dashboard/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  // Make all imported components and modules available to the template
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    IdeaFormComponent,
    DashboardComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fikra-frontend';
}