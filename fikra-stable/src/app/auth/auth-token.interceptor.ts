// src/app/auth/auth-token.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the token from localStorage.
  const authToken = localStorage.getItem('access_token');

  // If a token exists, clone the request to add the new header.
  if (authToken) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
    // Pass the cloned request instead of the original.
    return next(clonedReq);
  }

  // If no token, pass the original request along.
  return next(req);
};