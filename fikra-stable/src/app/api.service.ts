// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- DATA INTERFACES ---

export interface User {
  id: number;
  username: string;
}

export interface Comment {
  id: number;
  text: string;
  submission_date: Date;
  owner: User;
}

export interface Idea {
  id: number;
  submission_date: Date;
  original_text: string;
  language: string;
  ai_classification: string;
  ai_enhanced_text: string;
  owner: User;
  comments: Comment[];
  vote_count: number;
  tags: string | null; // <-- NEW: Add tags property
}

export interface SimilarIdea {
  id: number;
  original_text: string;
  similarity: number;
}

export interface IdeaCreate {
  original_text: string;
  language: string;
}

export interface CommentCreate {
  text: string;
}

export interface StatItem {
  name: string;
  value: number;
}

export interface StatsResponse {
  ideas_by_department: StatItem[];
  ideas_by_classification: StatItem[];
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  // --- Idea Methods ---
  getIdeas(): Observable<Idea[]> {
    return this.http.get<Idea[]>(`${this.apiUrl}/ideas/`);
  }

  submitIdea(idea: IdeaCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/ideas/`, idea);
  }

  // --- Similarity Search Method ---
  findSimilarIdeas(text: string): Observable<SimilarIdea[]> {
    return this.http.post<SimilarIdea[]>(`${this.apiUrl}/ideas/find-similar`, { text });
  }

  // --- Statistics Method ---
  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.apiUrl}/stats/`);
  }

  // --- Voting and Commenting Methods ---
  addVote(ideaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/ideas/${ideaId}/vote`, {});
  }

  addComment(ideaId: number, commentData: CommentCreate): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/ideas/${ideaId}/comments`, commentData);
  }
}
