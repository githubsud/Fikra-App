// src/app/login/login.component.ts
import { Component, Inject, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Import our services
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../shared/notification.service';

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
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  public loginData = { username: '', password: '' };

  // Inject LOCALE_ID to get the active language
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    @Inject(LOCALE_ID) public activeLocale: string
  ) { }

  login(): void {
    const isArabic = this.activeLocale.startsWith('ar');

    if (!this.loginData.username || !this.loginData.password) {
      const message = isArabic ? 'اسم المستخدم وكلمة المرور مطلوبان!' : 'Username and password are required!';
      this.notificationService.show(message, 'Close', true);
      return;
    }

    this.authService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response) => {
          const message = isArabic ? 'تم تسجيل الدخول بنجاح!' : 'Login Successful!';
          this.notificationService.show(message);
          this.router.navigate(['/main']);
        },
        error: (err) => {
          const message = isArabic ? 'فشل تسجيل الدخول. يرجى التحقق من اسم المستخدم وكلمة المرور.' : 'Login failed. Please check your username and password.';
          this.notificationService.show(message, 'Close', true);
        }
      });
  }
}
