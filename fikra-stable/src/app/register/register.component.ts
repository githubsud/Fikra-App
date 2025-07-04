// src/app/register/register.component.ts
import { Component, Inject, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Import our services
import { AuthService, UserCreate } from '../auth/auth.service';
import { NotificationService } from '../shared/notification.service';

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
    MatSnackBarModule,
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
    private router: Router,
    @Inject(LOCALE_ID) public activeLocale: string
  ) { }

  register(): void {
    const isArabic = this.activeLocale.startsWith('ar');

    if (!this.registerData.username || !this.registerData.password || !this.registerData.department) {
      const message = isArabic ? 'جميع الحقول مطلوبة!' : 'All fields are required!';
      this.notificationService.show(message, 'Close', true);
      return;
    }

    this.authService.register(this.registerData).subscribe({
        next: (response) => {
          const message = isArabic ? 'تم التسجيل بنجاح! يرجى تسجيل الدخول.' : 'Registration successful! Please log in.';
          this.notificationService.show(message);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const detail = err.error?.detail || (isArabic ? 'يرجى تجربة اسم مستخدم آخر.' : 'Please try another username.');
          const message = isArabic ? `فشل التسجيل: ${detail}` : `Registration failed: ${detail}`;
          this.notificationService.show(message, 'Close', true);
        }
      });
  }
}
