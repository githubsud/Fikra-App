// src/app/idea-form/idea-form.component.ts
import { Component, Output, EventEmitter } from '@angular/core'; // <-- ADDED Output and EventEmitter
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Needed for [(ngModel)]
import { HttpClientModule } from '@angular/common/http';

// Corrected Material Imports
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

import { ApiService, IdeaCreate } from '../api.service';

@Component({
  selector: 'app-idea-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    // Add components directly to imports
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatButton
  ],
  templateUrl: './idea-form.component.html',
  styleUrls: ['./idea-form.component.scss'],
})
export class IdeaFormComponent {
  @Output() ideaSubmitted = new EventEmitter<void>(); // <-- ADDED this line to create the event

  ideaText: string = '';
  isRecording: boolean = false;
  isSubmitting: boolean = false;

  constructor(private apiService: ApiService) {}

  toggleVoiceRecognition() {
    this.isRecording = !this.isRecording;
    // Voice recognition logic would go here
  }

  submit() {
    if (!this.ideaText.trim() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const newIdea: IdeaCreate = {
      username: 'temp_user', // Replace with actual user later
      department: 'temp_dept', // Replace with actual department later
      original_text: this.ideaText,
      language: 'en' // Or detect language
    };

    this.apiService.submitIdea(newIdea).subscribe({
      next: (response: any) => { // Added 'any' type to fix error
        console.log('Submission successful', response);
        this.ideaText = ''; // Clear the form
        this.isSubmitting = false;

        //console.log('1. FORM: Submission successful. Emitting event now...'); // <-- ADD THIS
        
        this.ideaSubmitted.emit(); // <-- ADDED this line to send the event
      },
      error: (err: any) => { // Added 'any' type to fix error
        console.error('Submission failed', err);
        this.isSubmitting = false;
        alert('There was an error submitting your idea. Please try again.');
      }
    });
  }
}