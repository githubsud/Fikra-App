// src/app/stats-dashboard/stats-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

import { ApiService, StatsResponse } from '../api.service';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule
  ],
  templateUrl: './stats-dashboard.component.html',
  styleUrls: ['./stats-dashboard.component.scss']
})
export class StatsDashboardComponent implements OnInit {

  // --- Chart #1: Ideas by Department (Bar Chart) ---
  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      x: { ticks: { color: 'white' } },
      y: { ticks: { color: 'white', stepSize: 1 }, min: 0 }
    },
    plugins: { legend: { labels: { color: 'white' } } }
  };
  public barChartData: ChartData<'bar'> = {
    labels: ['Loading...'],
    datasets: [
      // CHANGED THE COLOR HERE
      { data: [], label: 'Ideas per Department', backgroundColor: '#F39C12' }
    ]
  };
  public barChartType: ChartType = 'bar';

  // --- Chart #2: Ideas by Classification (Pie Chart) ---
  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top', labels: { color: 'white' } } }
  };
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      // UPDATED THE COLOR PALETTE HERE
      backgroundColor: ['#F39C12', '#0047AB', '#8892b0', '#17a2b8', '#28a745', '#dc3545'],
    }]
  };
  public pieChartType: ChartType = 'pie';


  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.apiService.getStats().subscribe({
      next: (stats: StatsResponse) => {
        // Re-assign the entire object for the bar chart
        this.barChartData = {
          labels: stats.ideas_by_department.map(item => item.name),
          datasets: [{
            data: stats.ideas_by_department.map(item => item.value),
            label: 'Ideas per Department',
            backgroundColor: '#F39C12' // Ensure new data uses the new color
          }]
        };

        // Re-assign the entire object for the pie chart
        this.pieChartData = {
          labels: stats.ideas_by_classification.map(item => item.name),
          datasets: [{
            data: stats.ideas_by_classification.map(item => item.value),
            backgroundColor: this.pieChartData.datasets[0].backgroundColor,
          }]
        };
      },
      error: (err) => {
        console.error('Failed to load statistics', err);
      }
    });
  }
}