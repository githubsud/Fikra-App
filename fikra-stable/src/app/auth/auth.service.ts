// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface UserCreate {
  username: string;
  department: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  register(userData: UserCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/`, userData);
  }

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/token`, body.toString(), { headers }).pipe(
      tap((response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
      })
    );
  }

  // NEW: Method to log the user out
  logout(): void {
    localStorage.removeItem('access_token');
  }

  // NEW: Helper method to check if a user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}