// src/app/components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { StatisticsService } from '../../../services/statistics.service';
import { User } from '../../../models/user.model';
import { Statistics } from '../../../models/statistics.model';

interface PendingAction {
  message: string;
  createdAt: Date;
}

interface Activity {
  action: string;
  user: string;
  date: Date;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  totalUsers: number = 0;
  totalDoctors: number = 0;
  totalPatients: number = 0;
  recentStatistics: { dataType: string, value: number, date: string }[] = [];
  recentActivity: Activity[] = [];
  pendingActions: PendingAction[] = [];
  isDarkMode: boolean = false;
  isSidebarOpen: boolean = false;
  isNotificationsOpen: boolean = false;

  constructor(
    private userService: UserService,
    private statisticsService: StatisticsService,
    private router: Router
  ) {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode ? JSON.parse(savedMode) : false;
  }

  ngOnInit(): void {
    this.loadUserStatistics();
    this.loadRecentStatistics();
    this.loadPendingActions();
    this.loadRecentActivity();
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  loadUserStatistics(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.totalUsers = users.length;
        this.totalDoctors = users.filter((u) => u.role === 'doctor').length;
        this.totalPatients = users.filter((u) => u.role === 'patient').length;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        console.log('Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          message: err.message,
        });
      },
    });
  }

  loadRecentStatistics(): void {
    this.statisticsService.getSystemStatistics().subscribe({
      next: (stats: any) => {
        console.log('Statistics response:', stats);
        const recentStats: { dataType: string, value: number, date: string }[] = [];

        // User Registrations
        if (stats.userRegistrations) {
          Object.entries(stats.userRegistrations).forEach(([date, count]) => {
            recentStats.push({
              dataType: 'User Registrations',
              value: Number(count),
              date: date
            });
          });
        }

        // Appointment Status Distribution
       

        // Limit to 5 entries
        this.recentStatistics = recentStats.slice(0, 5);
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        console.log('Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          message: err.message,
        });
      },
    });
  }

  loadPendingActions(): void {
    this.pendingActions = [
      { message: 'User approval pending: John Doe', createdAt: new Date() },
      { message: 'Feedback received from Jane Smith', createdAt: new Date() },
    ];
  }

  loadRecentActivity(): void {
    this.recentActivity = [
      { action: 'New user registered', user: 'Alice Brown', date: new Date() },
      { action: 'Feedback submitted', user: 'Bob Wilson', date: new Date() },
    ];
  }

  toggleSidebar(event: Event): void {
    event.stopPropagation();
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnClickOutside(event: Event): void {
    if (
      this.isSidebarOpen &&
      !(event.target as HTMLElement).closest('.sidebar') &&
      !(event.target as HTMLElement).closest('.sidebar-toggle')
    ) {
      this.isSidebarOpen = false;
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  calculateDashOffset(value: number, max: number): number {
    const circumference = 2 * Math.PI * 50;
    const percentage = Math.min(value / max, 1);
    return circumference * (1 - percentage);
  }

  approvePendingUsers(): void {
    this.router.navigate(['/admin/user-management'], { queryParams: { status: 'pending' } });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/auth/login']);
  }
}