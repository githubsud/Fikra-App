// src/app/shared/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // Inject Angular Material's MatSnackBar service in the constructor
  constructor(private snackBar: MatSnackBar) { }

  /**
   * Displays a notification snackbar.
   * @param message The message to show.
   * @param action The text for the action button (e.g., 'Close').
   * @param isError Whether to style the notification as an error.
   */
  show(message: string, action: string = 'Close', isError: boolean = false): void {
    this.snackBar.open(message, action, {
      duration: 5000, // The notification will disappear after 5 seconds
      verticalPosition: 'bottom', // Show it at the bottom of the screen
      horizontalPosition: 'center', // Center it horizontally
      // Apply a specific CSS class for error messages
      panelClass: isError ? ['snackbar-error'] : ['snackbar-success']
    });
  }
}
