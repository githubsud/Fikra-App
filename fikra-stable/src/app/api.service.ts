// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Idea {
  id: number;
  username: string;
  department: string;
  submission_date: Date;
  original_text: string;
  language: string;
  ai_classification: string;
  ai_enhanced_text: string;
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