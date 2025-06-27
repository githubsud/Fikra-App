// src/app/idea-form/idea-form.component.ts

import { Component, Output, EventEmitter, Inject, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import the full Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ApiService, IdeaCreate } from '../api.service';

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-idea-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './idea-form.component.html',
  styleUrls: ['./idea-form.component.scss'],
})
export class IdeaFormComponent {
  @Output() ideaSubmitted = new EventEmitter<void>();

  ideaText: string = '';
  isRecording: boolean = false;
  isSubmitting: boolean = false;
  
  recognition: any;

  constructor(
    private apiService: ApiService,
    @Inject(LOCALE_ID) public activeLocale: string,
    private cdr: ChangeDetectorRef // <-- 1. INJECT ChangeDetectorRef
  ) {
    // Check if the API is available
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    } else {
      console.error("Speech recognition not supported in this browser.");
    }
  }

  toggleVoiceRecognition() {
    if (!this.recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      return;
    }

    this.isRecording = true;
    this.recognition.lang = this.activeLocale;
    this.recognition.start();

    // This event fires every time the microphone detects speech
    this.recognition.onresult = (event: any) => {
      let final_transcript = '';
      let interim_transcript = '';

      // 2. SIMPLIFIED AND MORE ROBUST LOGIC
      // Iterate through all the results
      for (let i = 0; i < event.results.length; ++i) {
        // Concatenate the transcripts of all the results
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      // Update the text box with the full transcript so far
      this.ideaText = final_transcript + interim_transcript;
      
      // 3. MANUALLY FORCE ANGULAR TO UPDATE THE SCREEN
      this.cdr.detectChanges(); 
    };

    this.recognition.onend = () => {
      if (this.isRecording) {
        this.isRecording = false;
        this.cdr.detectChanges();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (this.isRecording) {
        this.isRecording = false;
        this.cdr.detectChanges();
      }
    };
  }

  submit() {
    if (!this.ideaText.trim() || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;

    const languageCode = this.activeLocale.split('-')[0];
    
    const newIdea: IdeaCreate = {
      original_text: this.ideaText,
      language: languageCode
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
