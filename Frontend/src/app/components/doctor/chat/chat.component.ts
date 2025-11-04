import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { ChatMessage } from '../../../models/chat.model';
import { Notification } from '../../../models/notification.model';
import { User } from '../../../models/user.model';
import { interval, Subscription } from 'rxjs';
import * as AOS from 'aos';
import * as THREE from 'three';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  messages: ChatMessage[] = [];
  recentNotifications: Notification[] = [];
  newMessage: string = '';
  patientId: number | null = null;
  patientName: string | null = null;
  patients: User[] = [];
  doctorId: number | null = null;
  isSidebarOpen = false;
  isDarkMode = false;
  isNotificationsOpen = false;
  private pollSubscription: Subscription | null = null;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.doctorId = this.authService.getCurrentUserId();
    if (this.doctorId) {
      this.loadPatients();
      this.loadRecentNotifications();
    } else {
      console.error('Doctor ID not found. Please log in.');
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit(): void {
    AOS.init({ duration: 1200, easing: 'ease-out-cubic', once: false });
    this.initWebGL();
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
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
      color: this.isDarkMode ? 0x66b0ff : 0x1877f2,
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
      (this.particles.material as THREE.PointsMaterial).color.set(this.isDarkMode ? 0x66b0ff : 0x1877f2);
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  loadPatients(): void {
    this.userService.getAllPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        console.log('Loaded patients:', JSON.stringify(patients, null, 2));
      },
      error: (err) => console.error('Error loading patients:', err),
    });
  }

  selectPatient(patientId: number): void {
    const selectedPatient = this.patients.find((patient) => patient.id === patientId);
    if (selectedPatient) {
      this.patientId = selectedPatient.id;
      this.patientName = selectedPatient.username ?? null;
      this.messages = [];
      console.log(`Selected patient ID: ${this.patientId}, loading messages for doctor ID: ${this.doctorId}`);
      this.loadMessages();
      this.startPolling();
    }
  }

  loadMessages(): void {
    if (!this.doctorId || !this.patientId) {
      console.warn('Cannot load messages: doctorId or patientId is null', {
        doctorId: this.doctorId,
        patientId: this.patientId,
      });
      return;
    }
    this.chatService.getChatHistory(this.doctorId, this.patientId).subscribe({
      next: (msgs) => {
        console.log('Raw chat history response:', JSON.stringify(msgs, null, 2));
        console.log('Assigning to messages:', JSON.stringify(msgs, null, 2));
        this.messages = msgs.map(msg => ({
          ...msg,
          read: msg.sender.id === this.doctorId || msg.read || false
        })).reverse(); // Reverse to show latest at bottom
        console.log('Messages after assignment:', JSON.stringify(this.messages, null, 2));
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => console.error('Error loading messages:', err),
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

  startPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
    this.pollSubscription = interval(5000).subscribe(() => this.loadMessages());
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.doctorId || !this.patientId) return;

    const message: ChatMessage = {
      id: 0,
      sender: { id: this.doctorId, username: '', email: '', role: 'doctor', active: true },
      receiver: { id: this.patientId, username: this.patientName || '', email: '', role: 'patient', active: true },
      message: this.newMessage,
      timestamp: new Date().toISOString(),
    };

    this.chatService.sendMessage(message).subscribe({
      next: (msg) => {
        this.messages.unshift(msg); // Add new message at the top (reverse order)
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => console.error('Error sending message:', err),
    });
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  hasUnreadMessages(patientId: number): boolean {
    if (!this.doctorId || this.patientId === patientId) return false;
    return this.messages.some(msg => msg.sender.id === patientId && msg.receiver.id === this.doctorId && !msg.read);
  }

  getAvatarColor(id: number): string {
    const colors = ['#e67e22', '#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f1c40f'];
    return colors[id % colors.length];
  }

  getLastMessage(patientId: number): string | null {
    const patientMessages = this.messages.filter(msg => msg.sender.id === patientId || msg.receiver.id === patientId);
    return patientMessages.length > 0 ? patientMessages[patientMessages.length - 1].message : null;
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