// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar'; // <-- Import SnackBar Module

// Import our services
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../shared/notification.service'; // <-- Import NotificationService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule, // <-- Add it to imports
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  public loginData = { username: '', password: '' };

  // Inject both services
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  login(): void {
    if (!this.loginData.username || !this.loginData.password) {
      this.notificationService.show('Username and password are required!', 'Close', true); // Use the service for errors
      return;
    }

    this.authService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response) => {
          console.log('Login successful!', response);
          this.notificationService.show('Login Successful!'); // Use the service for success
          this.router.navigate(['/main']);
        },
        error: (err) => {
          console.error('Login failed', err);
          this.notificationService.show('Login failed. Please check your username and password.', 'Close', true);
        }
      });
  }
}
