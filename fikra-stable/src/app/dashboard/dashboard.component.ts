// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- For the comment form
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; // <-- For icons
import { MatButtonModule } from '@angular/material/button'; // <-- For buttons
import { MatDividerModule } from '@angular/material/divider'; // <-- For dividers
import { MatExpansionModule } from '@angular/material/expansion'; // <-- For the accordion
import { MatListModule } from '@angular/material/list'; // <-- For the comment list
import { MatFormFieldModule } from '@angular/material/form-field'; // <-- For the comment input
import { MatInputModule } from '@angular/material/input'; // <-- For the comment input
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
    MarkdownModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  public ideas: Idea[] = [];
  // This object will hold the new comment text for each idea card
  public newCommentText: { [ideaId: number]: string } = {};

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadIdeas();
  }

  loadIdeas(): void {
    this.apiService.getIdeas().subscribe({
      next: (data: Idea[]) => {
        this.ideas = data;
      },
      error: (err: any) => console.error('Failed to load ideas', err)
    });
  }

  // NEW: Method to handle voting
  addVote(idea: Idea): void {
    this.apiService.addVote(idea.id).subscribe({
      next: () => {
        // For an instant UI update, we can reload all ideas.
        // A more advanced version might just update the single idea.
        this.loadIdeas();
      },
      error: (err) => console.error(`Failed to vote for idea ${idea.id}`, err)
    });
  }

  // NEW: Method to handle adding a comment
  addComment(idea: Idea): void {
    const commentText = this.newCommentText[idea.id];
    if (!commentText || commentText.trim() === '') {
      return; // Don't submit empty comments
    }

    const newComment: CommentCreate = { text: commentText };

    this.apiService.addComment(idea.id, newComment).subscribe({
      next: (addedComment) => {
        // Add the new comment to the list for an instant UI update
        idea.comments.push(addedComment);
        // Clear the input box
        this.newCommentText[idea.id] = '';
      },
      error: (err) => console.error(`Failed to add comment for idea ${idea.id}`, err)
    });
  }
}
