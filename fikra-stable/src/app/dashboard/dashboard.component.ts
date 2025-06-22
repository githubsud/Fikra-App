// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MarkdownModule } from 'ngx-markdown';
import { ApiService, Idea } from '../api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MarkdownModule
  ],
  templateUrl: './dashboard.html', // <-- Points to the correct file
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit { // <-- Correct class name
  public ideas: Idea[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadIdeas();
  }

  loadIdeas(): void {
    this.apiService.getIdeas().subscribe({
      next: (data: Idea[]) => {
        this.ideas = data;
      },
      error: (err: any) => {
        console.error('Failed to load ideas', err);
      }
    });
  }
}