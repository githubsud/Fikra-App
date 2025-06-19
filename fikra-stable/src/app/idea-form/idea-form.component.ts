// src/app/idea-form/idea-form.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { ApiService, IdeaCreate } from '../api.service';

@Component({
  selector: 'app-idea-form',
  standalone: true, // <-- ADDED
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
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
  @Output() ideaSubmitted = new EventEmitter<void>();
  ideaText: string = '';
  isRecording: boolean = false;
  isSubmitting: boolean = false;

  constructor(private apiService: ApiService) {}

  toggleVoiceRecognition() {
    this.isRecording = !this.isRecording;
  }

  submit() {
    if (!this.ideaText.trim() || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    const newIdea: IdeaCreate = {
      original_text: this.ideaText,
      language: 'en'
    };
    this.apiService.submitIdea(newIdea).subscribe({
      next: (response: any) => {
        console.log('Submission successful', response);
        this.ideaText = '';
        this.isSubmitting = false;
        this.ideaSubmitted.emit();
      },
      error: (err: any) => {
        console.error('Submission failed', err);
        this.isSubmitting = false;
        alert('There was an error submitting your idea. Please try again.');
      }
    });
  }
}