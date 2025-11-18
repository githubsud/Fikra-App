// src/app/stats-dashboard/stats-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // <-- Import RouterLink
import { MatIconModule } from '@angular/material/icon'; // <-- Import MatIconModule
import { MatButtonModule } from '@angular/material/button'; // <-- Import MatButtonModule

// Import the chart components and types
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Import our API Service
import { ApiService, StatsResponse } from '../api.service';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule,
    RouterLink,      // <-- Add it here
    MatIconModule,   // <-- Add it here
    MatButtonModule  // <-- Add it here
  ],
  // THESE ARE THE CORRECTED PATHS:
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
    plugins: {
      legend: { labels: { color: 'white' } }
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: ['Loading...'],
    datasets: [
      { data: [], label: 'Ideas per Department', backgroundColor: '#F39C12' }
    ]
  };
  public barChartType: ChartType = 'bar';

  // --- Chart #2: Ideas by Classification (Pie Chart) ---
  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: 'white' } },
      datalabels: {
        color: 'white',
        font: { weight: 'bold', size: 14 },
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => (a as number) + (b as number), 0) as number;
            if (total === 0) return '0%';
            return (value / total * 100).toFixed(1) + '%';
          }
          return '';
        },
      },
    }
  };
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#F39C12', '#0047AB', '#8892b0', '#17a2b8', '#28a745', '#dc3545'],
    }]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [ChartDataLabels];

  // --- Chart #3: Ideas by Category (Doughnut Chart) ---
  public doughnutChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: 'white' } },
      datalabels: {
        color: 'white',
        font: { weight: 'bold', size: 14 },
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => (a as number) + (b as number), 0) as number;
            if (total === 0) return '0%';
            return (value / total * 100).toFixed(1) + '%';
          }
          return '';
        },
      },
    }
  };
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#F39C12', '#0047AB', '#8892b0', '#17a2b8', '#28a745', '#dc3545', '#6f42c1', '#f012be', '#20c997'],
    }]
  };
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartPlugins = [ChartDataLabels];


  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.apiService.getStats().subscribe({
      next: (stats: StatsResponse) => {
        // Re-assign data for Bar Chart
        this.barChartData = {
          labels: stats.ideas_by_department.map(item => item.name),
          datasets: [{
            data: stats.ideas_by_department.map(item => item.value),
            label: 'Ideas per Department',
            backgroundColor: '#F39C12'
          }]
        };

        // Re-assign data for Pie Chart
        this.pieChartData = {
          labels: stats.ideas_by_classification.map(item => item.name),
          datasets: [{
            data: stats.ideas_by_classification.map(item => item.value),
            backgroundColor: this.pieChartData.datasets[0].backgroundColor,
          }]
        };

        // Re-assign data for Doughnut Chart
        this.doughnutChartData = {
          labels: stats.ideas_by_category.map(item => item.name),
          datasets: [{
            data: stats.ideas_by_category.map(item => item.value),
            backgroundColor: this.doughnutChartData.datasets[0].backgroundColor,
          }]
        };
      },
      error: (err) => {
        console.error('Failed to load statistics', err);
      }
    });
  }
}