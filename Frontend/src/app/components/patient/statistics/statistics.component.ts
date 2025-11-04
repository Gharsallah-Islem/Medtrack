import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

interface Statistics {
  dataType: string;
  value: string;
  date: string;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  mockStatistics: Statistics[] = [];
  isDarkMode: boolean = false;
  private charts: Chart[] = [];
  @ViewChild('chartCanvasHeartRate') chartCanvasHeartRate!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvasGlucose') chartCanvasGlucose!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvasBloodPressure') chartCanvasBloodPressure!: ElementRef<HTMLCanvasElement>;

  constructor() { }

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.generateMockData();
    this.renderCharts();
  }

  ngAfterViewInit(): void {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true });
    VanillaTilt.init(Array.from(document.querySelectorAll('[data-tilt]') as NodeListOf<HTMLElement>), {
      max: 15,
      speed: 400,
      glare: true,
      'max-glare': 0.5,
    });
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }

  generateMockData(): void {
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString();
    }).reverse();

    this.mockStatistics = [
      { dataType: 'heartRate', value: '72 bpm', date: dates[0] },
      { dataType: 'glucose', value: '95 mg/dL', date: dates[1] },
      { dataType: 'bloodPressure', value: '120/80 mmHg', date: dates[2] },
      { dataType: 'oxygenSaturation', value: '98%', date: dates[3] },
      { dataType: 'temperature', value: '36.8°C', date: dates[4] },
      { dataType: 'sleepHours', value: '7.5 hrs', date: dates[5] },
    ];
  }

  renderCharts(): void {
    if (!this.chartCanvasHeartRate || !this.chartCanvasGlucose || !this.chartCanvasBloodPressure) return;

    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // Heart Rate Line Chart (Mock Data)
    const heartRateData = [70, 72, 68, 74, 71, 73, 72];
    const ctxHeartRate = this.chartCanvasHeartRate.nativeElement.getContext('2d');
    this.charts.push(new Chart(ctxHeartRate!, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Heart Rate (bpm)',
          data: heartRateData,
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#FF6B6B',
        }],
      },
      options: {
        responsive: true,
        scales: {
          x: { type: 'time', time: { unit: 'day' }, title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Heart Rate (bpm)' }, min: 60, max: 80 },
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
      },
    }));

    // Glucose Level Bar Chart (Mock Data)
    const glucoseData = [90, 95, 93, 97, 92, 96, 94];
    const ctxGlucose = this.chartCanvasGlucose.nativeElement.getContext('2d');
    this.charts.push(new Chart(ctxGlucose!, {
      type: 'bar',
      data: {
        labels: dates.map(d => d.toLocaleDateString()),
        datasets: [{
          label: 'Glucose Level (mg/dL)',
          data: glucoseData,
          backgroundColor: '#4ECDC4',
          borderColor: '#3db8b0',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Glucose (mg/dL)' }, min: 80, max: 110 },
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
      },
    }));

    // Blood Pressure Area Chart (Mock Data)
    const systolicData = [118, 120, 122, 119, 121, 120, 123];
    const diastolicData = [78, 80, 79, 81, 80, 82, 79];
    const ctxBloodPressure = this.chartCanvasBloodPressure.nativeElement.getContext('2d');
    this.charts.push(new Chart(ctxBloodPressure!, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Systolic (mmHg)',
            data: systolicData,
            borderColor: '#FF9F1C',
            backgroundColor: 'rgba(255, 159, 28, 0.3)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Diastolic (mmHg)',
            data: diastolicData,
            borderColor: '#45B7D1',
            backgroundColor: 'rgba(69, 183, 209, 0.3)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { type: 'time', time: { unit: 'day' }, title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Blood Pressure (mmHg)' }, min: 60, max: 140 },
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
      },
    }));
  }

  getStatIcon(dataType: string): string {
    switch (dataType.toLowerCase()) {
      case 'heartrate':
        return 'fa-heart';
      case 'glucose':
        return 'fa-tint';
      case 'bloodpressure':
        return 'fa-heartbeat';
      case 'oxygensaturation':
        return 'fa-lungs';
      case 'temperature':
        return 'fa-thermometer-half';
      case 'sleephours':
        return 'fa-bed';
      default:
        return 'fa-chart-line';
    }
  }
}