// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MarkdownModule } from 'ngx-markdown';
import { ApiService, Idea } from '../api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true, // <-- ADDED
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MarkdownModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  public ideas: Idea[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadIdeas();
  }

  loadIdeas(): void {
    this.apiService.getIdeas().subscribe({
      next: (data: Idea[]) => { // <-- ADDED TYPE
        this.ideas = data;
        // ADD THIS LINE to see the exact data structure
        console.log('DATA RECEIVED BY DASHBOARD:', this.ideas);
      },
      error: (err: any) => { // <-- ADDED TYPE
        console.error('Failed to load ideas', err);
      }
    });
  }
}