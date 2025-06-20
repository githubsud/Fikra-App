// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// NEW: Defines the shape of the User object inside an Idea
export interface User {
  id: number;
  username: string;
}

// UPDATED: The Idea interface now has a nested 'owner' object
export interface Idea {
  id: number;
  submission_date: Date;
  original_text: string;
  language: string;
  ai_classification: string;
  ai_enhanced_text: string;
  owner: User; // <-- The user is a nested object
}

export interface IdeaCreate {
  original_text: string;
  language: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  getIdeas(): Observable<Idea[]> {
    return this.http.get<Idea[]>(`${this.apiUrl}/ideas/`);
  }

  submitIdea(idea: IdeaCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/ideas/`, idea);
  }
}