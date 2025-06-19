// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000'; // Your FastAPI backend URL

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    // The /token endpoint expects form data, not JSON.
    // We use HttpParams to build this form data.
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/token`, body.toString(), { headers }).pipe(
      tap((response: any) => {
        // This 'tap' operator lets us perform an action without changing the response.
        // On successful login, we save the access token to the browser's localStorage.
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
      })
    );
  }
}