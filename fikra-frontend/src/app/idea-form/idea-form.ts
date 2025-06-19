// src/app/idea-form/idea-form.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For [(ngModel)]
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService, IdeaCreate } from '../api.service';

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-idea-form',
  standalone: true, // This confirms it's a standalone component
  imports: [ // We import dependencies directly here
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './idea-form.html',
  styleUrls: ['./idea-form.scss']
})
export class IdeaFormComponent {
  // ... Paste the exact same CLASS logic from my previous answer here ...
  // (The part from `ideaText: string = '';` to the closing `}`)
  ideaText: string = '';
  isRecording = false;
  isSubmitting = false;
  recognition: any;

  constructor(
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let final_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          }
        }
        this.ideaText = this.ideaText + final_transcript;
        this.cd.detectChanges();
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.cd.detectChanges();
      };
    }
  }

  toggleVoiceRecognition(): void {
    if (!this.recognition) return;

    if (this.isRecording) {
      this.recognition.stop();
    } else {
      this.recognition.start();
      this.isRecording = true;
    }
  }

  submit(): void {
    if (!this.ideaText.trim() || this.isSubmitting) return;

    this.isSubmitting = true;

    const ideaData: IdeaCreate = {
      username: 'Employee 1',
      department: 'IT Department',
      original_text: this.ideaText,
      language: 'en'
    };

    this.apiService.submitIdea(ideaData).subscribe({
      next: (response) => {
        console.log('Idea submitted successfully!', response);
        this.ideaText = '';
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Submission failed', err);
        this.isSubmitting = false;
      }
    });
  }
}