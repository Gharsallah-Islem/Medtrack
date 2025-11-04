import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { Notification } from '../../../models/notification.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import * as THREE from 'three';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit, AfterViewInit {
  notifications: Notification[] = [];
  recentNotifications: Notification[] = [];
  isSidebarOpen = false;
  isDarkMode = false;
  isNotificationsOpen = false;
  isLoading = false;
  errorMessage: string | null = null;
  stats = {
    totalNotifications: 0,
    unreadNotifications: 0,
    notificationsToday: 0,
  };

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const doctorId = this.authService.getCurrentUserId();
    if (doctorId) {
      this.loadNotifications(doctorId);
      this.loadRecentNotifications(doctorId);
    } else {
      this.errorMessage = 'Authentication failed. Please log in.';
      setTimeout(() => this.router.navigate(['/login']), 2000);
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

  loadNotifications(doctorId: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.notificationService.getDoctorNotifications(doctorId).subscribe({
      next: (nots: Notification[]) => {
        this.notifications = nots.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
        this.updateStats();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load notifications. Please try again later.';
        console.error('Error loading notifications:', err);
        this.isLoading = false;
      },
    });
  }

  loadRecentNotifications(doctorId: number): void {
    this.notificationService.getDoctorNotifications(doctorId).subscribe({
      next: (nots: Notification[]) => {
        this.recentNotifications = nots
          .filter(not => !not.read)
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
          .slice(0, 5);
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load recent notifications.';
        console.error('Error loading recent notifications:', err);
      },
    });
  }

  updateStats(): void {
    this.stats.totalNotifications = this.notifications.length;
    this.stats.unreadNotifications = this.notifications.filter(not => !not.read).length;
    this.stats.notificationsToday = this.notifications.filter(not => {
      const notDate = new Date(not.sentAt);
      const now = new Date();
      return notDate.toDateString() === now.toDateString();
    }).length;
  }

  calculateDashOffset(value: number, max: number): number {
    const circumference = 314; // 2 * π * 50
    const percentage = Math.min(value / max, 1);
    return circumference * (1 - percentage);
  }

  markAsRead(id: number): void {
    this.notificationService.markNotificationAsRead(id).subscribe({
      next: () => {
        const notification = this.notifications.find((n) => n.id === id);
        if (notification) {
          notification.read = true;
          this.updateStats();
          this.loadRecentNotifications(this.authService.getCurrentUserId()!);
        }
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to mark notification as read.';
        console.error('Error marking notification as read:', err);
      },
    });
  }

  markAllAsRead(): void {
    const unreadIds = this.notifications.filter(not => !not.read).map(not => not.id);
    if (unreadIds.length > 0) {
      this.notificationService.markNotificationsAsRead(unreadIds).subscribe({
        next: () => {
          this.notifications.forEach(not => {
            if (!not.read) not.read = true;
          });
          this.updateStats();
          this.loadRecentNotifications(this.authService.getCurrentUserId()!);
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to mark all notifications as read.';
          console.error('Error marking all notifications as read:', err);
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
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}