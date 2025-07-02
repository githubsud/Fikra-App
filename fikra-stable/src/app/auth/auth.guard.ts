// src/app/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Inject the AuthService and Router so we can use them
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if the user is logged in using the method from our service
  if (authService.isLoggedIn()) {
    return true; // Yes, the user is logged in. Allow access to the page.
  } else {
    // No, the user is not logged in.
    // Redirect them to the login page.
    router.navigate(['/login']);
    return false; // Block access to the requested page.
  }
};
