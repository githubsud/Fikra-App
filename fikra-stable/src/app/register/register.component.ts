// src/app/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // <-- Import the Router

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Import our AuthService and the UserCreate interface
import { AuthService, UserCreate } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public registerData: UserCreate = {
    username: '',
    department: '',
    password: ''
  };

  // Inject both the AuthService and Router
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  register(): void {
    if (!this.registerData.username || !this.registerData.password || !this.registerData.department) {
      alert('All fields are required!');
      return;
    }

    // Call the register method from our service
    this.authService.register(this.registerData).subscribe({
        next: (response) => {
          console.log('Registration successful!', response);
          alert('Registration successful! Please log in with your new account.');
          this.router.navigate(['/login']); // Navigate to the login page on success
        },
        error: (err) => {
          console.error('Registration failed', err);
          // Check if the error detail is available
          const detail = err.error?.detail || 'Please try another username.';
          alert(`Registration failed: ${detail}`);
        }
      });
  }
}