import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Appointment } from '../../../models/appointment.model';
import { Notification } from '../../../models/notification.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import * as THREE from 'three';

@Component({
    selector: 'app-appointment-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './appointment-list.component.html',
    styleUrls: ['./appointment-list.component.css'],
})
export class AppointmentListComponent implements OnInit, AfterViewInit {
    appointments: Appointment[] = [];
    recentNotifications: Notification[] = [];
    doctorId: number | null = null;
    isSidebarOpen = false;
    isDarkMode = false;
    isNotificationsOpen = false;
    stats = {
        totalAppointments: 0,
        pendingApprovals: 0,
        cancelledThisMonth: 0,
    };

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private particles!: THREE.Points;

    constructor(
        private appointmentService: AppointmentService,
        private authService: AuthService,
        private notificationService: NotificationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.doctorId = this.authService.getCurrentUserId();
        if (this.doctorId) {
            this.loadAppointments();
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
            color: this.isDarkMode ? 0x63b3ed : 0x007bff,
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
            (this.particles.material as THREE.PointsMaterial).color.set(this.isDarkMode ? 0x63b3ed : 0x007bff);
            this.renderer.render(this.scene, this.camera);
        };
        animate();

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    loadAppointments(): void {
        this.appointmentService.getDoctorAppointments(this.doctorId!).subscribe({
            next: (appts) => {
                this.appointments = appts.map((appt: any) => ({
                    ...appt,
                    patientName: appt.patient?.username || 'Unknown Patient',
                    date: appt.slotStartTime ? new Date(appt.slotStartTime).toLocaleDateString() : 'Unknown Date',
                }));
                this.updateStats();
            },
            error: (err) => {
                console.error('Error loading appointments:', err);
                alert('Failed to load appointments. Please try again.');
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
            error: (err) => {
                console.error('Error loading notifications:', err);
                alert('Failed to load notifications. Please try again.');
            },
        });
    }

    updateStats(): void {
        this.stats.totalAppointments = this.appointments.length;
        this.stats.pendingApprovals = this.appointments.filter(appt => appt.status === 'pending').length;
        this.stats.cancelledThisMonth = this.appointments.filter(appt => {
            const apptDate = new Date(appt.slotStartTime || appt.createdAt);
            const now = new Date();
            return apptDate.getMonth() === now.getMonth() &&
                apptDate.getFullYear() === now.getFullYear();
        }).length;
    }

    calculateDashOffset(value: number, max: number): number {
        const circumference = 314; // 2 * π * 50
        const percentage = Math.min(value / max, 1);
        return circumference * (1 - percentage);
    }

    approveAppointment(appointmentId: number): void {
        if (confirm('Are you sure you want to approve this appointment?')) {
            this.appointmentService.approveAppointment(appointmentId).subscribe({
                next: () => {
                    const appt = this.appointments.find((a) => a.id === appointmentId);
                    if (appt) {
                        appt.status = 'approved';
                        this.updateStats();
                        alert('Appointment approved successfully.');
                    }
                },
                error: (err) => {
                    console.error('Error approving appointment:', err);
                    alert('Failed to approve appointment. Please try again.');
                },
            });
        }
    }

    cancelAppointment(appointmentId: number): void {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            this.appointmentService.cancelAppointment(appointmentId).subscribe({
                next: () => {
                    const appt = this.appointments.find((a) => a.id === appointmentId);
                    if (appt) {
                        this.updateStats();
                        alert('Appointment cancelled successfully.');
                    }
                },
                error: (err) => {
                    console.error('Error cancelling appointment:', err);
                    alert('Failed to cancel appointment. Please try again.');
                },
            });
        }
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
        this.isNotificationsOpen = this.isNotificationsOpen ? false : true;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}