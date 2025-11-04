import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ReportService } from '../../../services/report.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';
import { Report } from '../../../models/report.model';
import { HttpClient } from '@angular/common/http';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import * as THREE from 'three';

@Component({
  selector: 'app-patient-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-reports.component.html',
  styleUrls: ['./patient-reports.component.css'],
})
export class PatientReportsComponent implements OnInit, AfterViewInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  recentNotifications: Notification[] = [];
  filterText: string = '';
  sortBy: string = 'date-desc';
  doctorId: number | null = null;
  isSidebarOpen = false;
  isDarkMode = false;
  isNotificationsOpen = false;
  isLoading = false;
  errorMessage: string | null = null;
  stats = {
    totalReports: 0,
    reportsThisMonth: 0,
    pendingReviews: 0,
  };

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.doctorId = this.authService.getCurrentUserId();
    if (this.doctorId) {
      this.loadReports();
      this.loadRecentNotifications();
    } else {
      console.error('Doctor ID not found. Please log in.');
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit(): void {
    AOS.init({ duration: 1200, easing: 'ease-out-cubic', once: false });
    VanillaTilt.init(Array.from(document.querySelectorAll('[data-tilt]') as NodeListOf<HTMLElement>), {
      max: 25,
      speed: 300,
      glare: true,
      'max-glare': 0.7,
      perspective: 1000,
    });
    this.initWebGL();
  }

  initWebGL(): void {
    const canvas = document.getElementById('bgCanvas') as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: this.isDarkMode ? 0x63b3ed : 0x4a90e2,
      size: 5,
      transparent: true,
      opacity: 0.6,
    });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    this.camera.position.z = 500;

    const animate = () => {
      requestAnimationFrame(animate);
      this.particles.rotation.x += 0.0005;
      this.particles.rotation.y += 0.0005;
      (this.particles.material as THREE.PointsMaterial).color.set(this.isDarkMode ? 0x63b3ed : 0x4a90e2);
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  loadReports(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.reportService.getDoctorReports(this.doctorId!).subscribe({
      next: (reports) => {
        this.reports = reports;
        this.filteredReports = [...reports];
        this.updateStats();
        this.sortReports();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.errorMessage = 'Failed to load reports. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadRecentNotifications(): void {
    this.notificationService.getDoctorNotifications(this.doctorId!).subscribe({
      next: (nots) => {
        this.recentNotifications = nots
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
          .slice(0, 5);
      },
      error: (err) => console.error('Error loading notifications:', err),
    });
  }

  updateStats(): void {
    this.stats.totalReports = this.reports.length;
    this.stats.reportsThisMonth = this.reports.filter(report => {
      const reportDate = new Date(report.sentAt);
      const now = new Date();
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    }).length;
    this.stats.pendingReviews = this.reports.filter(report => report.sentStatus === 'pending').length;
  }

  calculateDashOffset(value: number, max: number): number {
    const circumference = 314;
    const percentage = Math.min(value / max, 1);
    return circumference * (1 - percentage);
  }

  filterReports(): void {
    const filter = this.filterText.toLowerCase();
    this.filteredReports = this.reports.filter(
      (report) =>
        report.patient.username.toLowerCase().includes(filter) ||
        report.patient.id.toString().includes(filter) ||
        new Date(report.sentAt).toLocaleString().toLowerCase().includes(filter)
    );
    this.sortReports();
  }

  clearFilter(): void {
    this.filterText = '';
    this.filteredReports = [...this.reports];
    this.sortReports();
  }

  sortReports(): void {
    this.filteredReports.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
        case 'date-asc':
          return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
        case 'status-asc':
          return a.sentStatus.localeCompare(b.sentStatus);
        case 'status-desc':
          return b.sentStatus.localeCompare(a.sentStatus);
        default:
          return 0;
      }
    });
    this.cdr.detectChanges();
  }

  viewReport(report: Report): void {
    if (!report.pdfPath) {
      this.errorMessage = 'No PDF available for this report.';
      return;
    }
    const filename = report.pdfPath.split('/').pop();
    const fileUrl = `http://localhost:8081/api/reports/files/${filename}`;
    window.open(fileUrl, '_blank');
  }

  downloadReport(reportId: number): void {
    const fileUrl = `http://localhost:8081/api/reports/download/${reportId}`;
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const report = this.reports.find(r => r.id === reportId);
        const filename = report?.pdfPath.split('/').pop() || `report_${reportId}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading report:', err);
        this.errorMessage = 'Failed to download report: ' + (err.status === 403 ? 'Unauthorized access.' : err.message || 'Unknown error.');
      },
    });
  }

  markAsReviewed(report: Report): void {
    this.http.put(`http://localhost:8081/api/reports/${report.id}/status`, { sentStatus: 'reviewed' }).subscribe({
      next: () => {
        report.sentStatus = 'reviewed';
        this.updateStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating report status:', err);
        this.errorMessage = 'Failed to mark report as reviewed. Please try again.';
      },
    });
  }

  toggleSidebar(event: MouseEvent): void {
    event.stopPropagation();
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isSidebarOpen && !target.closest('.sidebar') && !target.closest('.notification-bubble')) {
      this.isSidebarOpen = false;
    }
    if (this.isNotificationsOpen && !target.closest('.notification-bubble') && !target.closest('.notification-dropdown')) {
      this.isNotificationsOpen = false;
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}