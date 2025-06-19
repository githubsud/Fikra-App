import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define interfaces matching your Pydantic models
export interface Idea {
  id: number;
  username: string;
  department: string;
  original_text: string;
  language: string;
  ai_classification: string;
  ai_enhanced_text: string;
  submission_date: string;
}

export interface IdeaCreate {
  username: string;
  department: string;
  original_text: string;
  language: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000'; // Your FastAPI backend URL

  constructor(private http: HttpClient) {}

  getIdeas(): Observable<Idea[]> {
    return this.http.get<Idea[]>(`${this.apiUrl}/ideas/`);
  }

  submitIdea(ideaData: IdeaCreate): Observable<Idea> {
    return this.http.post<Idea>(`${this.apiUrl}/ideas/`, ideaData);
  }
}