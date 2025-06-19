import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  // This object will hold the username and password from the form
  public loginData = { username: '', password: '' };

  // Inject the AuthService in the constructor
  constructor(private authService: AuthService) { }

  login(): void {
    if (!this.loginData.username || !this.loginData.password) {
      alert('Username and password are required!');
      return;
    }

    // Call the login method from our service
    this.authService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response) => {
          console.log('Login successful!', response);
          alert('Success! You are now logged in. We will redirect you in the next step.');
          // In the next step, we will navigate to the dashboard here.
        },
        error: (err) => {
          console.error('Login failed', err);
          alert('Login failed. Please check your username and password.');
        }
      });
  }
}