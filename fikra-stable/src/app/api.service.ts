// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- INTERFACES FOR IDEAS ---
export interface User {
  id: number;
  username: string;
}

export interface Idea {
  id: number;
  submission_date: Date;
  original_text: string;
  language: string;
  ai_classification: string;
  ai_enhanced_text: string;
  owner: User;
}

export interface IdeaCreate {
  original_text: string;
  language: string;
}

// --- NEW: INTERFACES FOR STATISTICS ---
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
    // We will add the auth token here in a future step
    return this.http.post(`${this.apiUrl}/ideas/`, idea);
  }

  // --- NEW: Statistics Method ---
  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.apiUrl}/stats/`);
  }
}