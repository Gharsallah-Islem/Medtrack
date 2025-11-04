import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StatisticsService } from '../../../services/statistics.service';
import { Statistics } from '../../../models/statistics.model';
import { FormsModule } from '@angular/forms';

declare var google: any;

interface PendingAction {
  message: string;
  createdAt: Date;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit {
  statistics: Statistics[] = [];
  pendingActions: PendingAction[] = [];
  isDarkMode: boolean = false;
  isSidebarOpen: boolean = false;
  isNotificationsOpen: boolean = false;
  startDate: string = '2025-01-01'; // Default date range
  endDate: string = '2025-12-31';
  adminStats: any = {};

  constructor(
    private statisticsService: StatisticsService,
    private router: Router
  ) {
    // Initialize dark mode from local storage
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode ? JSON.parse(savedMode) : false;
  }

  ngOnInit(): void {
    // Load Google Charts
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      this.loadAdminStatistics();
    });

    this.loadPendingActions();
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  loadAdminStatistics(): void {
    this.statisticsService.getAdminStatistics(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.adminStats = data;
        this.drawCharts();
      },
      error: (err) => console.error('Error loading admin statistics:', err),
    });
  }

  loadPendingActions(): void {
    this.pendingActions = [
      { message: 'New statistic data pending review', createdAt: new Date() },
    ];
  }

  drawCharts(): void {
    this.drawUserRegistrationsChart();
    this.drawAppointmentStatusChart();
    this.drawAppointmentsByDoctorChart();
    this.drawBloodPressureChart();
    this.drawEngagementScoresChart();
    this.drawPeakUsageChart();
  }

  drawUserRegistrationsChart(): void {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Date');
    dataTable.addColumn('number', 'Registrations');

    const registrations = this.adminStats.userRegistrations || {};
    const rows = Object.entries(registrations).map(([date, count]) => [date, Number(count)]);
    dataTable.addRows(rows);

    const options = {
      title: 'User Registrations Over Time',
      hAxis: { 
        title: 'Date', 
        format: 'yyyy-MM-dd', 
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      vAxis: { 
        title: 'Number of Registrations',
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      legend: { position: 'top' },
      colors: ['#6B46C1'],
      backgroundColor: this.isDarkMode ? '#2D3748' : '#F7FAFC',
      titleTextStyle: { color: this.isDarkMode ? '#D6BCFA' : '#6B46C1' },
    };

    const chart = new google.visualization.LineChart(document.getElementById('userRegistrationsChart'));
    chart.draw(dataTable, options);
  }

  drawAppointmentStatusChart(): void {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Status');
    dataTable.addColumn('number', 'Count');

    const distribution = this.adminStats.appointmentStatusDistribution || {};
    const rows = Object.entries(distribution).map(([status, count]) => [status, Number(count)]);
    dataTable.addRows(rows);

    const options = {
      title: 'Appointment Distribution by Status',
      pieHole: 0.4,
      legend: { position: 'top' },
      colors: ['#6B46C1', '#D6BCFA', '#8A4AF3', '#B794F4'],
      backgroundColor: this.isDarkMode ? '#2D3748' : '#F7FAFC',
      titleTextStyle: { color: this.isDarkMode ? '#D6BCFA' : '#6B46C1' },
    };

    const chart = new google.visualization.PieChart(document.getElementById('appointmentStatusChart'));
    chart.draw(dataTable, options);
  }

  drawAppointmentsByDoctorChart(): void {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Doctor');
    dataTable.addColumn('number', 'Appointments');

    const byDoctor = this.adminStats.appointmentsByDoctor || {};
    const rows = Object.entries(byDoctor).map(([doctor, count]) => [doctor, Number(count)]);
    dataTable.addRows(rows);

    const options = {
      title: 'Appointments by Doctor',
      hAxis: { 
        title: 'Doctor', 
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      vAxis: { 
        title: 'Number of Appointments',
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      legend: { position: 'none' },
      colors: ['#6B46C1'],
      backgroundColor: this.isDarkMode ? '#2D3748' : '#F7FAFC',
      titleTextStyle: { color: this.isDarkMode ? '#D6BCFA' : '#6B46C1' },
    };

    const chart = new google.visualization.BarChart(document.getElementById('appointmentsByDoctorChart'));
    chart.draw(dataTable, options);
  }

  drawBloodPressureChart(): void {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Date');
    dataTable.addColumn('number', 'Average Blood Pressure (mmHg)');

    const bpData = this.adminStats.avgBloodPressureByDate || {};
    const rows = Object.entries(bpData).map(([date, avg]) => [date, Number(avg)]);
    dataTable.addRows(rows);

    const options = {
      title: 'Average Blood Pressure Over Time',
      hAxis: { 
        title: 'Date', 
        format: 'yyyy-MM-dd', 
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      vAxis: { 
        title: 'Average Blood Pressure (mmHg)', 
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      legend: { position: 'top' },
      colors: ['#D6BCFA'],
      backgroundColor: this.isDarkMode ? '#2D3748' : '#F7FAFC',
      titleTextStyle: { color: this.isDarkMode ? '#D6BCFA' : '#6B46C1' },
    };

    const chart = new google.visualization.LineChart(document.getElementById('bloodPressureChart'));
    chart.draw(dataTable, options);
  }

  drawEngagementScoresChart(): void {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Patient ID');
    dataTable.addColumn('number', 'Engagement Score');

    const scores = this.adminStats.engagementScores || {};
    const rows = Object.entries(scores).map(([patientId, score]) => [`Patient ${patientId}`, Number(score)]);
    dataTable.addRows(rows);

    const options = {
      title: 'Patient Engagement Scores',
      hAxis: { 
        title: 'Patient', 
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      vAxis: { 
        title: 'Engagement Score',
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      legend: { position: 'none' },
      colors: ['#8A4AF3'],
      backgroundColor: this.isDarkMode ? '#2D3748' : '#F7FAFC',
      titleTextStyle: { color: this.isDarkMode ? '#D6BCFA' : '#6B46C1' },
    };

    const chart = new google.visualization.BarChart(document.getElementById('engagementScoresChart'));
    chart.draw(dataTable, options);
  }

  drawPeakUsageChart(): void {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Hour');
    dataTable.addColumn('number', 'Appointments');

    const byHour = this.adminStats.appointmentsByHour || {};
    const rows = Object.entries(byHour).map(([hour, count]) => [`${hour}:00`, Number(count)]);
    dataTable.addRows(rows);

    const options = {
      title: 'Peak Appointment Hours',
      hAxis: { 
        title: 'Hour of Day', 
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      vAxis: { 
        title: 'Number of Appointments', 
        textStyle: { color: this.isDarkMode ? '#A0AEC0' : '#4A5568' } 
      },
      legend: { position: 'none' },
      colors: ['#B794F4'],
      backgroundColor: this.isDarkMode ? '#2D3748' : '#F7FAFC',
      titleTextStyle: { color: this.isDarkMode ? '#D6BCFA' : '#6B46C1' },
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('peakUsageChart'));
    chart.draw(dataTable, options);
  }

  toggleSidebar(event: Event): void {
    event.stopPropagation();
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnClickOutside(event: Event): void {
    if (this.isSidebarOpen && !(event.target as HTMLElement).closest('.sidebar') && !(event.target as HTMLElement).closest('.sidebar-toggle')) {
      this.isSidebarOpen = false;
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    this.drawCharts(); // Redraw charts to update colors
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/auth/login']);
  }
}