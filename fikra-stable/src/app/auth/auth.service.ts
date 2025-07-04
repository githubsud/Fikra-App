// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface UserCreate { username: string; department: string; password: string; }
export interface User { id: number; username: string; department: string; }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000'; // <-- Reverted to localhost
  public currentUser = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) { }

  register(userData: UserCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/`, userData);
  }

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams().set('username', username).set('password', password);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post(`${this.apiUrl}/token`, body.toString(), { headers }).pipe(
      tap((response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          this.getCurrentUser().subscribe();
        }
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me/`).pipe(
      tap(user => this.currentUser.next(user))
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUser.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
