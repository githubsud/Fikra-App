// src/app/idea-card/idea-card.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf and the date pipe
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { Idea } from '../api.service';

@Component({
  selector: 'app-idea-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule
  ],
  templateUrl: './idea-card.html',
  styleUrls: ['./idea-card.scss']
})
export class IdeaCardComponent {
  @Input() idea?: Idea;
}