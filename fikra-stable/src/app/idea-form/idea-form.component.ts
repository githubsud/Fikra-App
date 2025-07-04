// src/app/idea-form/idea-form.component.ts
import { Component, Output, EventEmitter, Inject, LOCALE_ID, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Import Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ApiService, IdeaCreate, SimilarIdea } from '../api.service';
import { NotificationService } from '../shared/notification.service';

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
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './idea-form.component.html',
  styleUrls: ['./idea-form.component.scss'],
})
export class IdeaFormComponent implements OnInit, OnDestroy {
  @Output() ideaSubmitted = new EventEmitter<void>();

  ideaText: string = '';
  isRecording: boolean = false;
  isSubmitting: boolean = false;
  
  similarIdeas: SimilarIdea[] = [];
  isSearching: boolean = false;
  private searchText$ = new Subject<string>();
  private searchSubscription!: Subscription;
  
  recognition: any;
  textBeforeRecording: string = '';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
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
    this.searchSubscription = this.searchText$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(text => {
        if (!text || text.length < 10) {
          this.similarIdeas = [];
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
    this.searchSubscription.unsubscribe();
  }

  onSearchTextChange(text: string): void {
    this.searchText$.next(text);
  }

  toggleVoiceRecognition() {
    const isArabic = this.activeLocale.startsWith('ar');
    if (!this.recognition) {
      const message = isArabic ? 'التعرف على الكلام غير مدعوم في هذا المتصفح.' : 'Speech recognition is not supported in this browser.';
      this.notificationService.show(message, 'Close', true);
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      return;
    }

    this.isRecording = true;
    this.textBeforeRecording = this.ideaText;
    this.recognition.lang = this.activeLocale;
    this.recognition.start();

    this.recognition.onresult = (event: any) => {
      let final_transcript = '';
      let interim_transcript = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      this.ideaText = this.textBeforeRecording + final_transcript + interim_transcript;
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

    const isArabic = this.activeLocale.startsWith('ar');

    this.apiService.submitIdea(newIdea).subscribe({
      next: (response: any) => {
        const message = isArabic ? 'تم تقديم الفكرة بنجاح!' : 'Idea submitted successfully!';
        this.notificationService.show(message);
        this.ideaText = '';
        this.isSubmitting = false;
        this.ideaSubmitted.emit();
      },
      error: (err: any) => {
        console.error('Submission failed', err);
        this.isSubmitting = false;
        const message = isArabic ? 'حدث خطأ أثناء تقديم فكرتك. يرجى المحاولة مرة أخرى.' : 'There was an error submitting your idea. Please try again.';
        this.notificationService.show(message, 'Close', true);
      }
    });
  }
}
