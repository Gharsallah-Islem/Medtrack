import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RatingService } from '../../../services/rating.service';
import { AppointmentService } from '../../../services/appointment.service';
import { StatisticsService } from '../../../services/statistics.service';
import { Rating } from '../../../models/rating.model';
import { Appointment } from '../../../models/appointment.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

@Component({
  selector: 'app-doctor-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class DoctorStatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  doctorId: number | null = null;
  ratings: Rating[] = [];
  appointments: Appointment[] = [];
  stats: any = {};
  isLoading = true;
  errorMessage: string | null = null;
  isDarkMode = false;
  isSidebarOpen = false;
  private charts: Chart[] = [];
  @ViewChild('chartCanvasRating') chartCanvasRating!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvasAppointments') chartCanvasAppointments!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvasSatisfaction') chartCanvasSatisfaction!: ElementRef<HTMLCanvasElement>;

  constructor(
    private authService: AuthService,
    private ratingService: RatingService,
    private appointmentService: AppointmentService,
    private statisticsService: StatisticsService,
    private router: Router
  ) {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode ? JSON.parse(savedMode) : false;
  }

  ngOnInit(): void {
    this.doctorId = this.authService.getCurrentUserId();
    console.log('Doctor ID:', this.doctorId);
    console.log('Auth token:', localStorage.getItem('auth_token'));
    if (this.doctorId) {
      this.loadData();
    } else {
      this.errorMessage = 'Failed to retrieve doctor ID. Please log in again.';
      this.isLoading = false;
    }
  }

  ngAfterViewInit(): void {
    AOS.init({ duration: 1000, once: true });
    VanillaTilt.init(Array.from(document.querySelectorAll('[data-tilt]') as NodeListOf<HTMLElement>), {
      max: 15,
      speed: 400,
      glare: true,
      'max-glare': 0.5,
    });
    // Render charts after view initialization
    if (!this.isLoading && !this.errorMessage) {
      this.renderCharts();
    }
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }

  toggleSidebar(event: MouseEvent): void {
    event.stopPropagation();
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isSidebarOpen && !target.closest('.sidebar')) {
      this.isSidebarOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const ratings$ = this.ratingService.getDoctorRatings(this.doctorId!);
    const appointments$ = this.appointmentService.getDoctorAppointments(this.doctorId!);
    const stats$ = this.statisticsService.getDoctorStatistics(this.doctorId!);

    Promise.allSettled([ratings$, appointments$, stats$].map(obs => obs.toPromise()))
      .then(results => {
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            if (index === 0) {
              this.ratings = Array.isArray(result.value) ? result.value : [];
              console.log('Raw ratings response:', result.value);
              console.log('Ratings length:', this.ratings.length);
            }
            if (index === 1) {
              this.appointments = Array.isArray(result.value) ? result.value : [];
              console.log('Raw appointments response:', result.value);
              console.log('Appointments length:', this.appointments.length);
            }
            if (index === 2) {
              this.stats = result.value || {};
              console.log('Raw stats response:', result.value);
              console.log('Stats keys:', Object.keys(this.stats));
            }
          } else {
            console.error(`Request ${index} failed:`, result.reason);
            if (index === 0) this.errorMessage = `Failed to load ratings: ${result.reason.message || 'Unknown error'}`;
            if (index === 1) this.errorMessage = `Failed to load appointments: ${result.reason.message || 'Unknown error'}`;
            if (index === 2) this.errorMessage = `Failed to load statistics: ${result.reason.message || 'Unknown error'}`;
          }
        });
        this.isLoading = false;
        // Trigger chart rendering after view initialization
        setTimeout(() => this.renderCharts(), 0);
      })
      .catch(err => {
        this.errorMessage = 'Failed to load data. Please try again later.';
        console.error('Error loading data:', err);
        this.isLoading = false;
      });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    this.updateChartStyles();
  }

  renderCharts(): void {
    if (!this.chartCanvasRating || !this.chartCanvasAppointments || !this.chartCanvasSatisfaction) {
      console.error('Chart canvases not found');
      this.errorMessage = 'Unable to render charts. Please try again.';
      return;
    }

    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    // Average Rating Over Time (Line Chart)
    const ratingData = this.aggregateRatingsByMonth();
    console.log('Rating chart data:', ratingData);
    const ctxRating = this.chartCanvasRating.nativeElement.getContext('2d');
    if (ctxRating) {
      this.charts.push(new Chart(ctxRating, {
        type: 'line',
        data: {
          labels: ratingData.labels,
          datasets: [{
            label: 'Average Rating (out of 5)',
            data: ratingData.values,
            borderColor: this.isDarkMode ? '#FF8787' : '#FF6B6B',
            backgroundColor: this.isDarkMode ? 'rgba(255, 135, 135, 0.2)' : 'rgba(255, 107, 107, 0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: this.isDarkMode ? '#FF8787' : '#FF6B6B',
          }],
        },
        options: {
          responsive: true,
          scales: {
            x: { type: 'time', time: { unit: 'month' }, title: { display: true, text: 'Date' }, ticks: { color: this.isDarkMode ? '#D1D5DB' : '#4B5563' } },
            y: { title: { display: true, text: 'Rating' }, min: 0, max: 5, ticks: { color: this.isDarkMode ? '#D1D5DB' : '#4B5563' } },
          },
          plugins: {
            legend: { position: 'top', labels: { color: this.isDarkMode ? '#D1D5DB' : '#4B5563' } },
            tooltip: { mode: 'index', intersect: false, backgroundColor: this.isDarkMode ? '#2D3748' : '#FFFFFF', titleColor: this.isDarkMode ? '#E2E8F0' : '#1A202C', bodyColor: this.isDarkMode ? '#E2E8F0' : '#1A202C' },
          },
        },
      }));
    } else {
      console.error('Failed to get 2D context for rating chart');
    }

    // Number of Appointments Over Time (Area Chart)
    const apptData = this.aggregateAppointmentsByMonth();
    console.log('Appointment chart data:', apptData);
    const ctxAppointments = this.chartCanvasAppointments.nativeElement.getContext('2d');
    if (ctxAppointments) {
      this.charts.push(new Chart(ctxAppointments, {
        type: 'line',
        data: {
          labels: apptData.labels,
          datasets: [{
            label: 'Appointments per Month',
            data: apptData.values,
            borderColor: this.isDarkMode ? '#6DE2D7' : '#4ECDC4',
            backgroundColor: this.isDarkMode ? 'rgba(109, 226, 215, 0.3)' : 'rgba(78, 205, 196, 0.3)',
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          scales: {
            x: { type: 'time', time: { unit: 'month' }, title: { display: true, text: 'Date' }, ticks: { color: this.isDarkMode ? '#D1D5DB' : '#4B5563' } },
            y: { title: { display: true, text: 'Number of Appointments' }, beginAtZero: true, ticks: { color: this.isDarkMode ? '#D1D5DB' : '#4B5563' } },
          },
          plugins: {
            legend: { position: 'top', labels: { color: this.isDarkMode ? '#D1D5DB' : '#4B5563' } },
            tooltip: { mode: 'index', intersect: false, backgroundColor: this.isDarkMode ? '#2D3748' : '#FFFFFF', titleColor: this.isDarkMode ? '#E2E8F0' : '#1A202C', bodyColor: this.isDarkMode ? '#E2E8F0' : '#1A202C' },
          },
        },
      }));
    } else {
      console.error('Failed to get 2D context for appointments chart');
    }

    // Patient Satisfaction Trend (Bar Chart)
    const satisfactionData = this.calculateSatisfactionTrend();
    console.log('Satisfaction chart data:', satisfactionData);
    const ctxSatisfaction = this.chartCanvasSatisfaction.nativeElement.getContext('2d');
    if (ctxSatisfaction) {
      this.charts.push(new Chart(ctxSatisfaction, {
        type: 'bar',
        data: {
          labels: satisfactionData.labels,
          datasets: [{
            label: 'Patient Satisfaction (%)',
            data: satisfactionData.values,
            backgroundColor: this.isDarkMode ? '#FFB84C' : '#FF9F1C',
            borderColor: this.isDarkMode ? '#E5943A' : '#E58E1A',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          scales: {
            x: { type: 'time', time: { unit: 'month' }, title: { display: true, text: 'Date' }, ticks: { color: this.isDarkMode ? '#D1D5DB' : '#4B5563' } },
            y: { title: { display: true, text: 'Satisfaction (%)' }, min: 0, max: 100, ticks: { color: this.isDarkMode ? '#D1D5DB' : '#4B5563' } },
          },
          plugins: {
            legend: { position: 'top', labels: { color: this.isDarkMode ? '#D1D5DB' : '#4B5563' } },
            tooltip: { mode: 'index', intersect: false, backgroundColor: this.isDarkMode ? '#2D3748' : '#FFFFFF', titleColor: this.isDarkMode ? '#E2E8F0' : '#1A202C', bodyColor: this.isDarkMode ? '#E2E8F0' : '#1A202C' },
          },
        },
      }));
    } else {
      console.error('Failed to get 2D context for satisfaction chart');
    }
  }

  updateChartStyles(): void {
    this.charts.forEach(chart => {
      chart.data.datasets.forEach((dataset: any) => {
        if (dataset.label === 'Average Rating (out of 5)') {
          dataset.borderColor = this.isDarkMode ? '#FF8787' : '#FF6B6B';
          dataset.backgroundColor = this.isDarkMode ? 'rgba(255, 135, 135, 0.2)' : 'rgba(255, 107, 107, 0.2)';
          dataset.pointBackgroundColor = this.isDarkMode ? '#FF8787' : '#FF6B6B';
        } else if (dataset.label === 'Appointments per Month') {
          dataset.borderColor = this.isDarkMode ? '#6DE2D7' : '#4ECDC4';
          dataset.backgroundColor = this.isDarkMode ? 'rgba(109, 226, 215, 0.3)' : 'rgba(78, 205, 196, 0.3)';
        } else if (dataset.label === 'Patient Satisfaction (%)') {
          dataset.backgroundColor = this.isDarkMode ? '#FFB84C' : '#FF9F1C';
          dataset.borderColor = this.isDarkMode ? '#E5943A' : '#E58E1A';
        }
      });
      chart.options.scales!['x']!.ticks!.color = this.isDarkMode ? '#D1D5DB' : '#4B5563';
      chart.options.scales!['y']!.ticks!.color = this.isDarkMode ? '#D1D5DB' : '#4B5563';
      chart.options.plugins!.legend!.labels!.color = this.isDarkMode ? '#D1D5DB' : '#4B5563';
      chart.options.plugins!.tooltip!.backgroundColor = this.isDarkMode ? '#2D3748' : '#FFFFFF';
      chart.options.plugins!.tooltip!.titleColor = this.isDarkMode ? '#E2E8F0' : '#1A202C';
      chart.options.plugins!.tooltip!.bodyColor = this.isDarkMode ? '#E2E8F0' : '#1A202C';
      chart.update();
    });
  }

  aggregateRatingsByMonth(): { labels: Date[], values: number[] } {
    const monthlyRatings: { [key: string]: { total: number, count: number } } = {};
    this.ratings.forEach(rating => {
      const createdAt = rating.createdAt || '2025-05-02T00:00:00'; // Fallback to default date
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in rating.createdAt:', createdAt, 'Rating:', rating);
        return;
      }
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyRatings[key]) {
        monthlyRatings[key] = { total: 0, count: 0 };
      }
      monthlyRatings[key].total += rating.rating;
      monthlyRatings[key].count += 1;
    });

    const labels: Date[] = [];
    const values: number[] = [];
    Object.keys(monthlyRatings).sort().forEach(key => {
      const [year, month] = key.split('-').map(Number);
      labels.push(new Date(year, month - 1));
      values.push(monthlyRatings[key].total / monthlyRatings[key].count || 0);
    });

    console.log('Aggregated ratings:', monthlyRatings);
    return { labels, values };
  }

  aggregateAppointmentsByMonth(): { labels: Date[], values: number[] } {
    const monthlyAppointments: { [key: string]: number } = {};
    this.appointments.forEach(appt => {
      const dateStr = appt.slot?.slotStartTime || appt.createdAt;
      if (!dateStr) {
        console.warn('Appointment with null slotStartTime and createdAt:', appt);
        return;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in appointment:', dateStr, 'Appointment:', appt);
        return;
      }
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyAppointments[key] = (monthlyAppointments[key] || 0) + 1;
    });

    const labels: Date[] = [];
    const values: number[] = [];
    if (Object.keys(monthlyAppointments).length === 0) {
      // Fallback: Show current month with zero appointments
      const now = new Date();
      labels.push(new Date(now.getFullYear(), now.getMonth()));
      values.push(0);
    } else {
      Object.keys(monthlyAppointments).sort().forEach(key => {
        const [year, month] = key.split('-').map(Number);
        labels.push(new Date(year, month - 1));
        values.push(monthlyAppointments[key]);
      });
    }

    console.log('Aggregated appointments:', monthlyAppointments);
    return { labels, values };
  }

  calculateSatisfactionTrend(): { labels: Date[], values: number[] } {
    const monthlySatisfaction: { [key: string]: { total: number, count: number } } = {};
    this.ratings.forEach(rating => {
      const createdAt = rating.createdAt || '2025-05-02T00:00:00'; // Fallback to default date
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in rating.createdAt:', createdAt, 'Rating:', rating);
        return;
      }
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlySatisfaction[key]) {
        monthlySatisfaction[key] = { total: 0, count: 0 };
      }
      const satisfaction = (rating.rating / 5) * 100;
      monthlySatisfaction[key].total += satisfaction;
      monthlySatisfaction[key].count += 1;
    });

    const labels: Date[] = [];
    const values: number[] = [];
    Object.keys(monthlySatisfaction).sort().forEach(key => {
      const [year, month] = key.split('-').map(Number);
      labels.push(new Date(year, month - 1));
      values.push(monthlySatisfaction[key].total / monthlySatisfaction[key].count || 0);
    });

    console.log('Aggregated satisfaction:', monthlySatisfaction);
    return { labels, values };
  }
}