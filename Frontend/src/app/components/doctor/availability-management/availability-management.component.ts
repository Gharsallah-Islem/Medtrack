import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AvailabilityService } from '../../../services/availability.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Availability } from '../../../models/availability.model';
import { AppointmentSlot } from '../../../models/AvailabilityResponse';
import { Notification } from '../../../models/notification.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import * as THREE from 'three';

@Component({
    selector: 'app-availability-management',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './availability-management.component.html',
    styleUrls: ['./availability-management.component.css'],
})
export class AvailabilityManagementComponent implements OnInit, AfterViewInit {
    slots: AppointmentSlot[] = [];
    recentNotifications: Notification[] = [];
    newAvailability: Availability = { date: '', startTime: '', endTime: '' };
    doctorId: number | null = null;
    isSidebarOpen = false;
    isDarkMode = false;
    today: string = '';
    isPastDateSelected: boolean = false;
    isNotificationsOpen = false;
    selectedDate: string = '';
    stats = {
        totalSlots: 0,
        availableSlots: 0,
        unavailableThisWeek: 0,
    };
    errorMessage: string = '';
    private tokenKey = 'auth_token';

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private particles!: THREE.Points;

    constructor(
        private availabilityService: AvailabilityService,
        private authService: AuthService,
        private notificationService: NotificationService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Set today and selectedDate to current date in YYYY-MM-DD format
        const today = new Date();
        this.today = today.toISOString().split('T')[0];
        this.selectedDate = this.today;

        this.doctorId = this.authService.getCurrentUserId();
        const token = localStorage.getItem(this.tokenKey);
        console.log('Token in ngOnInit:', token);
        if (this.doctorId && token) {
            this.loadSlots();
            this.loadRecentNotifications();
        } else {
            console.error('No token or doctor ID found. Redirecting to login.');
            this.router.navigate(['/login']);
        }
    }

    onDateChange(): void {
        // Validate selected date
        this.isPastDateSelected = this.selectedDate < this.today;
        if (!this.isPastDateSelected) {
            this.loadSlots();
        } else {
            this.slots = []; // Clear slots if past date is selected
            this.updateStats();
            this.cdr.detectChanges();
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

    loadSlots(): void {
        if (this.doctorId) {
            console.log('Loading slots for date:', this.selectedDate);
            this.availabilityService.getDoctorSlots(this.doctorId, this.selectedDate).subscribe({
                next: (slots) => {
                    console.log('Fetched slots:', JSON.stringify(slots, null, 2));
                    this.slots = slots;
                    this.updateStats();
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error loading slots:', err);
                    this.errorMessage = 'Failed to load availability slots. Please try again.';
                    this.slots = []; // Clear slots on error
                    this.updateStats();
                    this.cdr.detectChanges();
                },
            });
        }
    }

    loadRecentNotifications(): void {
        if (this.doctorId) {
            this.notificationService.getDoctorNotifications(this.doctorId).subscribe({
                next: (nots) => {
                    this.recentNotifications = nots
                        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                        .slice(0, 5);
                },
                error: (err) => console.error('Error loading notifications:', err),
            });
        }
    }

    updateStats(): void {
        this.stats.totalSlots = this.slots.length;
        this.stats.availableSlots = this.slots.filter(slot => !slot.booked).length;
        this.stats.unavailableThisWeek = this.slots.filter(slot => {
            const slotDate = new Date(slot.slotStartTime);
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            return slot.booked && slotDate >= startOfWeek;
        }).length;
        console.log('Updated stats:', JSON.stringify(this.stats, null, 2));
    }

    calculateDashOffset(value: number, max: number): number {
        const circumference = 314; // 2 * π * 50
        const percentage = Math.min(value / max, 1);
        return circumference * (1 - percentage);
    }

    addAvailability(): void {
        this.errorMessage = '';
        const token = localStorage.getItem(this.tokenKey);
        if (!token) {
            this.errorMessage = 'Please log in to add availability.';
            this.router.navigate(['/login']);
            return;
        }
        const formattedAvailability = {
            date: this.newAvailability.date,
            startTime: this.newAvailability.startTime,
            endTime: this.newAvailability.endTime
        };
        console.log('Sending availability:', JSON.stringify(formattedAvailability, null, 2));
        this.availabilityService.addAvailability(formattedAvailability).subscribe({
            next: (newAvail) => {
                console.log('Added availability:', JSON.stringify(newAvail, null, 2));
                this.loadSlots();
                this.resetNewAvailability();
                this.updateStats();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error adding availability:', err);
                if (err.status === 400) {
                    this.errorMessage = `Invalid data format: ${err.error || 'Please check your input.'}`;
                } else if (err.status === 403) {
                    this.errorMessage = 'Unauthorized access. Please log in as a doctor.';
                } else {
                    this.errorMessage = err.error || 'Error adding availability. Please try again.';
                }
            },
        });
    }

    resetNewAvailability(): void {
        this.newAvailability = { date: '', startTime: '', endTime: '' };
    }

    isFormValid(): boolean {
        return this.newAvailability.date !== '' &&
            this.newAvailability.date >= this.today &&
            this.newAvailability.startTime !== '' &&
            this.newAvailability.endTime !== '';
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