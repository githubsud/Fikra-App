// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips'; // <-- This is the module for chips
import { MarkdownModule } from 'ngx-markdown';
import { ApiService, Idea, CommentCreate } from '../api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MarkdownModule,
    MatChipsModule // <-- It must be included here
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  public allIdeas: Idea[] = [];
  public filteredIdeas: Idea[] = [];
  public newCommentText: { [ideaId: number]: string } = {};
  public activeTag: string | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadIdeas();
  }

  loadIdeas(): void {
    this.apiService.getIdeas().subscribe({
      next: (data: Idea[]) => {
        this.allIdeas = data;
        this.applyFilter(); // Apply current filter or show all
      },
      error: (err: any) => console.error('Failed to load ideas', err)
    });
  }

  parseTags(tagsJson: string | null): string[] {
    if (!tagsJson) return [];
    try {
      return JSON.parse(tagsJson);
    } catch (e) {
      return [];
    }
  }

  filterByTag(tag: string): void {
    if (this.activeTag === tag) {
      this.activeTag = null; // Deselect if clicked again
    } else {
      this.activeTag = tag;
    }
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeTag) {
      this.filteredIdeas = this.allIdeas.filter(idea => {
        const ideaTags = this.parseTags(idea.tags);
        return ideaTags.includes(this.activeTag!);
      });
    } else {
      this.filteredIdeas = this.allIdeas; // No tag selected, show all
    }
  }

  addVote(idea: Idea): void {
    this.apiService.addVote(idea.id).subscribe({
      next: () => this.loadIdeas(),
      error: (err) => console.error(`Failed to vote for idea ${idea.id}`, err)
    });
  }

  addComment(idea: Idea): void {
    const commentText = this.newCommentText[idea.id];
    if (!commentText || commentText.trim() === '') return;

    const newComment: CommentCreate = { text: commentText };
    this.apiService.addComment(idea.id, newComment).subscribe({
      next: (addedComment) => {
        idea.comments.push(addedComment);
        this.newCommentText[idea.id] = '';
      },
      error: (err) => console.error(`Failed to add comment for idea ${idea.id}`, err)
    });
  }
}
