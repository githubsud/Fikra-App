import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // <-- 1. IMPORT the Router

// Import Angular Material Modules for the form
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Import our AuthService
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  public loginData = { username: '', password: '' };

  // 2. INJECT the Router in the constructor
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  login(): void {
    if (!this.loginData.username || !this.loginData.password) {
      alert('Username and password are required!');
      return;
    }

    this.authService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response) => {
          console.log('Login successful!', response);
          // 3. NAVIGATE to the main page on success
          this.router.navigate(['/main']);
        },
        error: (err) => {
          console.error('Login failed', err);
          alert('Login failed. Please check your username and password.');
        }
      });
  }
}