import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MedicationService } from '../../../services/medication.service';
import { AppointmentService } from '../../../services/appointment.service';
import { NotificationService } from '../../../services/notification.service';
import { StatisticsService } from '../../../services/statistics.service';
import { Medication } from '../../../models/medication.model';
import { Appointment } from '../../../models/appointment.model';
import { Notification } from '../../../models/notification.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import { WebSocketService } from '../../../services/websocket.service';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

@Component({
    selector: 'app-patient-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './patient-dashboard.component.html',
    styleUrls: ['./patient-dashboard.component.css'],
})
export class PatientDashboardComponent implements OnInit, AfterViewInit {
    upcomingMedications: Medication[] = [];
    nextAppointment: Appointment | null = null;
    recentNotifications: Notification[] = [];
    patientId: number | null = null;
    patientName: string | null = null;
    bloodPressure: string | null = null;
    glucoseLevel: string | null = null;
    heartRate: string | null = null;
    oxygenSaturation: string | null = null;
    temperature: string | null = null;
    sleepHours: string | null = null;
    isDarkMode: boolean = false;
    isChatOpen: boolean = false;
    chatMessages: ChatMessage[] = [];
    isTyping: boolean = false;
    @ViewChild('chatBody') chatBody!: ElementRef;
    @ViewChild('chatInput') chatInput!: ElementRef;

    constructor(
        private authService: AuthService,
        private medicationService: MedicationService,
        private appointmentService: AppointmentService,
        private notificationService: NotificationService,
        private statisticsService: StatisticsService,
        private webSocketService: WebSocketService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const savedDarkMode = localStorage.getItem('darkMode');
        this.isDarkMode = savedDarkMode === 'true';
        this.patientId = this.authService.getCurrentUserId();
        if (this.patientId) {
            this.patientName = this.authService.getCurrentUser()?.name || 'John Doe';
            this.loadUpcomingMedications();
            this.loadNextAppointment();
            this.loadRecentNotifications();
            this.loadHealthStatistics();
            this.setupWebSocket();
        }
        AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true });
    }

    ngAfterViewInit(): void {
        VanillaTilt.init(Array.from(document.querySelectorAll('[data-tilt]') as NodeListOf<HTMLElement>), {
            max: 15,
            speed: 400,
            glare: true,
            'max-glare': 0.5,
        });
    }

    loadUpcomingMedications(): void {
        if (!this.patientId) return;
        this.medicationService.getPatientMedications(this.patientId).subscribe({
            next: (meds) => {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                this.upcomingMedications = meds
                    .filter((med) => {
                        try {
                            const schedules = JSON.parse(med.schedules);
                            const endDate = new Date(schedules.endDate);
                            return endDate >= new Date(today);
                        } catch (e) {
                            console.error('Error parsing schedules:', med.schedules, e);
                            return false;
                        }
                    })
                    .sort((a, b) => {
                        const earliestA = this.getEarliestTime(a);
                        const earliestB = this.getEarliestTime(b);
                        return new Date(earliestA).getTime() - new Date(earliestB).getTime();
                    })
                    .slice(0, 3);
            },
            error: (err) => console.error('Error loading medications:', err),
        });
    }

    loadNextAppointment(): void {
        if (!this.patientId) return;
        this.appointmentService.getPatientAppointments(this.patientId).subscribe({
            next: (appts) => {
                const now = new Date();
                const futureAppointments = appts
                    .filter((appt) => new Date(appt.slotStartTime || appt.createdAt) > now && appt.status !== 'completed')
                    .sort((a, b) => new Date(a.slotStartTime || a.createdAt).getTime() - new Date(b.slotStartTime || b.createdAt).getTime());
                this.nextAppointment = futureAppointments[0] || null;
                if (this.nextAppointment) {
                    this.nextAppointment.doctorName = this.nextAppointment.doctor?.username || 'Unknown Doctor';
                }
            },
            error: (err) => console.error('Error loading appointments:', err),
        });
    }

    loadRecentNotifications(): void {
        if (!this.patientId) return;
        this.notificationService.getPatientNotifications(this.patientId).subscribe({
            next: (nots) => {
                this.recentNotifications = nots
                    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                    .slice(0, 5);
            },
            error: (err) => console.error('Error loading notifications:', err),
        });
    }

    loadHealthStatistics(): void {
        if (!this.patientId) return;
        this.statisticsService.getPatientStatistics(this.patientId).subscribe({
            next: (stats) => {
                const latestStats = stats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const findStat = (type: string) => latestStats.find((s) => s.dataType === type)?.value || null;
                this.bloodPressure = findStat('bloodPressure') || '120/80 mmHg';
                this.glucoseLevel = findStat('glucose') || '95 mg/dL';
                this.heartRate = findStat('heartRate') || '72 bpm';
                this.oxygenSaturation = findStat('oxygenSaturation') || '98%';
                this.temperature = findStat('temperature') || '36.8°C';
                this.sleepHours = findStat('sleepHours') || '7.5 hrs';
            },
            error: (err) => console.error('Error loading statistics:', err),
        });
    }

    setupWebSocket(): void {
        this.webSocketService.connect().subscribe((message: Notification) => {
            this.recentNotifications.unshift(message);
            this.recentNotifications = this.recentNotifications.slice(0, 5);
            this.scrollChatToBottom();
        });
    }

    getEarliestTime(med: Medication): string {
        try {
            const schedules = JSON.parse(med.schedules);
            const today = new Date();
            const startDate = new Date(schedules.startDate);
            const times = schedules.dailyTimes.split(',').map((t: string) => t.trim());
            const earliestTimeToday = times[0]; // First time of the day
            const dateToUse = startDate > today ? startDate : today;
            return `${dateToUse.toISOString().split('T')[0]}T${earliestTimeToday}:00`;
        } catch (e) {
            console.error('Error parsing schedules for med:', med, e);
            return new Date().toISOString(); // Fallback
        }
    }

    toggleDarkMode(): void {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode.toString());
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

    // Chatbot Functionality
    toggleChatWindow(): void {
        this.isChatOpen = !this.isChatOpen;
        if (this.isChatOpen) {
            setTimeout(() => this.scrollChatToBottom(), 0);
        }
    }

    minimizeChatWindow(): void {
        this.isChatOpen = false;
    }

    closeChatWindow(): void {
        this.isChatOpen = false;
        this.chatMessages = [];
    }

    sendMessage(): void {
        const input = this.chatInput.nativeElement.value.trim();
        if (!input || this.isTyping) return;

        this.chatMessages.push({ role: 'user', content: input });
        this.isTyping = true;
        this.chatInput.nativeElement.value = '';
        this.scrollChatToBottom();

        // Simulate assistant response (replace with real API call if available)
        setTimeout(() => {
            this.chatMessages.push({ role: 'assistant', content: 'This is a simulated response. How can I assist you today?' });
            this.isTyping = false;
            this.scrollChatToBottom();
        }, 1000);
    }

    toggleVoiceInput(): void {
        // Implement voice input logic here (e.g., using Web Speech API)
        alert('Voice input feature is not implemented yet.');
    }

    scrollChatToBottom(): void {
        if (this.chatBody && this.chatBody.nativeElement) {
            this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
        }
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Escape' && this.isChatOpen) {
            this.closeChatWindow();
        }
    }
}