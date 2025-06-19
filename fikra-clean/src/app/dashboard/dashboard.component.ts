// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ApiService, Idea } from '../api.service';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-dashboard',
  standalone: true, // <-- FIX #1: Added standalone: true
  imports: [
    CommonModule,
    MatCardModule,
    DatePipe, // Import DatePipe for formatting dates
    MarkdownModule
  ],
  templateUrl: './dashboard.html', // <-- FIX #2: Pointing to the correct HTML file
  styleUrls: ['./dashboard.scss']  // Pointing to the correct SCSS file
})
export class DashboardComponent implements OnInit {
  public ideas: Idea[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadIdeas();
  }

  loadIdeas(): void {
    //console.log('3. DASHBOARD: The loadIdeas() method was successfully called!'); // <-- ADD THIS
    this.apiService.getIdeas().subscribe({
      next: (data) => {
        this.ideas = data;
      },
      error: (err) => {
        console.error('Failed to load ideas', err);
      }
    });
  }
}