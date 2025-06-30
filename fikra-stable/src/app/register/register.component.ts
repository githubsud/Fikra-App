// src/app/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar'; // <-- Import SnackBar Module

// Import our services
import { AuthService, UserCreate } from '../auth/auth.service';
import { NotificationService } from '../shared/notification.service'; // <-- Import NotificationService

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
    MatSnackBarModule, // <-- Add it to imports
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

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  register(): void {
    if (!this.registerData.username || !this.registerData.password || !this.registerData.department) {
      this.notificationService.show('All fields are required!', 'Close', true);
      return;
    }

    this.authService.register(this.registerData).subscribe({
        next: (response) => {
          console.log('Registration successful!', response);
          this.notificationService.show('Registration successful! Please log in.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Registration failed', err);
          const detail = err.error?.detail || 'Please try another username.';
          this.notificationService.show(`Registration failed: ${detail}`, 'Close', true);
        }
      });
  }
}
