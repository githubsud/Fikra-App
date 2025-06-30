// src/app/idea-form/idea-form.component.ts

import { Component, Output, EventEmitter, Inject, LOCALE_ID, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// RxJS imports for real-time search
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Import Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list'; // For the results list
import { MatProgressBarModule } from '@angular/material/progress-bar'; // For loading indicator

import { ApiService, IdeaCreate, SimilarIdea } from '../api.service';

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
    MatButtonModule,
    MatListModule,
    MatProgressBarModule
  ],
  templateUrl: './idea-form.component.html',
  styleUrls: ['./idea-form.component.scss'],
})
export class IdeaFormComponent implements OnInit, OnDestroy {
  @Output() ideaSubmitted = new EventEmitter<void>();

  ideaText: string = '';
  isRecording: boolean = false;
  isSubmitting: boolean = false;
  
  // --- NEW PROPERTIES FOR SIMILARITY SEARCH ---
  similarIdeas: SimilarIdea[] = [];
  isSearching: boolean = false;
  private searchText$ = new Subject<string>();
  private searchSubscription!: Subscription;
  
  recognition: any;
  textBeforeRecording: string = '';

  constructor(
    private apiService: ApiService,
    @Inject(LOCALE_ID) public activeLocale: string,
    private cdr: ChangeDetectorRef
  ) {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    } else {
      console.error("Speech recognition not supported in this browser.");
    }
  }

  ngOnInit(): void {
    // Set up the real-time search logic
    this.searchSubscription = this.searchText$.pipe(
      debounceTime(500), // Wait for 500ms after the user stops typing
      distinctUntilChanged(), // Only search if the text has changed
      switchMap(text => { // Switch to a new API call, cancelling previous ones
        if (!text || text.length < 10) {
          this.similarIdeas = []; // Clear results if text is too short
          return [];
        }
        this.isSearching = true;
        return this.apiService.findSimilarIdeas(text);
      })
    ).subscribe(results => {
      this.isSearching = false;
      this.similarIdeas = results;
    });
  }

  ngOnDestroy(): void {
    // Clean up the subscription to prevent memory leaks
    this.searchSubscription.unsubscribe();
  }

  // NEW: This method is called every time the user types
  onSearchTextChange(text: string): void {
    this.searchText$.next(text);
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
