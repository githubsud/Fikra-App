// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Time } from '@angular/common';

// Define the shape of the Idea object we expect from the backend
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

// Define the shape of the data for creating an idea
export interface IdeaCreate {
  username: string;
  department: string;
  original_text: string;
  language: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000'; // Your FastAPI backend URL

  constructor(private http: HttpClient) { }

  // Method to GET all ideas from the backend
  getIdeas(): Observable<Idea[]> {
    return this.http.get<Idea[]>(`${this.apiUrl}/ideas/`);
  }

  // Method to POST a new idea
  submitIdea(idea: IdeaCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/ideas/`, idea);
  }
}