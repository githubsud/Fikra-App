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
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarkdownModule } from 'ngx-markdown';
import { ApiService, Idea, CommentCreate } from '../api.service';
import { NotificationService } from '../shared/notification.service';

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
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'] // <-- THIS PATH IS NOW CORRECT
})
export class DashboardComponent implements OnInit {
  public allIdeas: Idea[] = [];
  public filteredIdeas: Idea[] = [];
  public newCommentText: { [ideaId: number]: string } = {};
  public activeTag: string | null = null;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadIdeas();
  }

  loadIdeas(): void {
    this.apiService.getIdeas().subscribe({
      next: (data: Idea[]) => {
        this.allIdeas = data;
        this.applyFilter();
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
    this.activeTag = this.activeTag === tag ? null : tag;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeTag) {
      this.filteredIdeas = this.allIdeas.filter(idea => 
        this.parseTags(idea.tags).includes(this.activeTag!)
      );
    } else {
      this.filteredIdeas = this.allIdeas;
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

  exportPdf(idea: Idea): void {
    this.notificationService.show('Generating PDF...');
    this.apiService.exportIdeaPdf(idea.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `idea_proposal_${idea.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        console.error(`Failed to export PDF for idea ${idea.id}`, err);
        this.notificationService.show('Failed to generate PDF.', 'Close', true);
      }
    });
  }
}
