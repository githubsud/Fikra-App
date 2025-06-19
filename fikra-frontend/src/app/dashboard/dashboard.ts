// src/app/dashboard/dashboard.ts (or dashboard.component.ts)

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts'; // <-- Correct import
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective // <-- Add the directive here
  ],
  templateUrl: './dashboard.html', // Make sure your HTML file is named this
  styleUrls: ['./dashboard.scss']  // Make sure your SCSS file is named this
})
export class DashboardComponent {
  // Example data for the Donut Chart
  public donutChartData: ChartConfiguration['data'] = {
    labels: ['Process Optimization', 'Technology Adoption', 'Employee Welfare'],
    datasets: [
      {
        data: [350, 450, 100],
        backgroundColor: ['#0A192F', '#112240', '#F39C12'],
      },
    ],
  };
  public donutChartType: ChartType = 'doughnut';
}