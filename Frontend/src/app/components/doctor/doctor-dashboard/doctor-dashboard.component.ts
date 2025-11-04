import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AppointmentService } from '../../../services/appointment.service';
import { ReportService } from '../../../services/report.service';
import { NotificationService } from '../../../services/notification.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Appointment } from '../../../models/appointment.model';
import { Report } from '../../../models/report.model';
import { Notification } from '../../../models/notification.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import * as THREE from 'three';

@Component({
    selector: 'app-doctor-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './doctor-dashboard.component.html',
    styleUrls: ['./doctor-dashboard.component.css'],
})
export class DoctorDashboardComponent implements OnInit, AfterViewInit {
    upcomingAppointments: Appointment[] = [];
    recentReports: Report[] = [];
    recentNotifications: Notification[] = [];
    doctorId: number | null = null;
    isSidebarOpen = false;
    isDarkMode = false;
    isNotificationsOpen = false;
    profile = {
        firstName: '',
        lastName: '',
        isProfileComplete: false,
    };
    stats = {
        appointmentsToday: 0,
        patientsManaged: 0,
        reportsReviewed: 0,
        avgConsultationTime: 0,
        weeklyAppointments: 0,
    };

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private particles!: THREE.Points;

    constructor(
        private authService: AuthService,
        private appointmentService: AppointmentService,
        private reportService: ReportService,
        private notificationService: NotificationService,
        private http: HttpClient,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.doctorId = this.authService.getCurrentUserId();
        if (this.doctorId) {
            this.loadUserProfile();
            this.loadUpcomingAppointments();
            this.loadRecentReports();
            this.loadRecentNotifications();
            this.loadDoctorStats();
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

    loadUserProfile(): void {
        const token = localStorage.getItem('auth_token');
        console.log('JWT Token for /api/users/me:', token);
        if (!token) {
            console.error('No JWT token found. Redirecting to login.');
            this.router.navigate(['/login']);
            return;
        }
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        });
        this.http.get('http://localhost:8081/api/users/me', { headers }).subscribe({
            next: (user: any) => {
                console.log('User Profile Response:', user);
                this.profile = {
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    isProfileComplete: user.isProfileComplete || false,
                };
            },
            error: (err) => {
                console.error('Error loading user profile:', err);
                console.log('Error Details:', err.error);
                if (err.status === 403) {
                    console.error('Forbidden: Invalid or expired token. Redirecting to login.');
                    this.authService.logout();
                    this.router.navigate(['/login']);
                }
            },
        });
    }

    loadUpcomingAppointments(): void {
        this.appointmentService.getDoctorAppointments(this.doctorId!).subscribe({
            next: (appts) => {
                const now = new Date();
                this.upcomingAppointments = appts
                    .filter((appt) => new Date(appt.slotStartTime || appt.createdAt) >= now && appt.status !== 'completed')
                    .sort((a, b) => new Date(a.slotStartTime || a.createdAt).getTime() - new Date(b.slotStartTime || b.createdAt).getTime())
                    .slice(0, 3);
                this.upcomingAppointments.forEach(appt => {
                    appt.patient.username = appt.patient?.username || 'Unknown Patient';
                });
                this.loadDoctorStats();
            },
            error: (err) => console.error('Error loading appointments:', err),
        });
    }

    loadRecentReports(): void {
        this.reportService.getDoctorReports(this.doctorId!).subscribe({
            next: (reports) => {
                this.recentReports = reports
                    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                    .slice(0, 3);
                this.loadDoctorStats();
            },
            error: (err) => console.error('Error loading reports:', err),
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

    loadDoctorStats(): void {
        this.stats.appointmentsToday = this.upcomingAppointments.filter(appt => {
            const apptDate = new Date(appt.slotStartTime || appt.createdAt);
            const today = new Date();
            return apptDate.getDate() === today.getDate() &&
                apptDate.getMonth() === today.getMonth() &&
                apptDate.getFullYear() === today.getFullYear();
        }).length;

        this.stats.patientsManaged = new Set(this.upcomingAppointments.map(appt => appt.patient.username)).size;
        this.stats.reportsReviewed = this.recentReports.length;
        this.stats.avgConsultationTime = 25; // Placeholder value as per request
        this.stats.weeklyAppointments = 12; // Placeholder value as per request
    }

    calculateDashOffset(value: number, max: number): number {
        const circumference = 314;
        const percentage = Math.min(value / max, 1);
        return circumference * (1 - percentage);
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