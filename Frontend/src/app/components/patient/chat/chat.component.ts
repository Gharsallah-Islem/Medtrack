import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ChatMessage } from '../../../models/chat.model';
import { User } from '../../../models/user.model';
import { interval, Subscription } from 'rxjs';
import * as AOS from 'aos';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  doctorId: number | null = null;
  doctorName: string | null = null;
  doctors: User[] = [];
  patientId: number | null = null;
  private pollSubscription: Subscription | null = null;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.patientId = this.authService.getCurrentUserId();
    if (this.patientId) {
      this.loadDoctors();
    }
  }

  ngAfterViewInit(): void {
    AOS.init({ duration: 500, once: true });
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  loadDoctors(): void {
    this.userService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        if (doctors.length > 0) {
          this.selectDoctor(doctors[0].id);
        }
      },
      error: (err) => console.error('Error loading doctors:', err),
    });
  }

  selectDoctor(doctorId: number): void {
    const selectedDoctor = this.doctors.find((doctor) => doctor.id === doctorId);
    if (selectedDoctor) {
      this.doctorId = selectedDoctor.id;
      this.doctorName = selectedDoctor.username ?? null;
      this.loadMessages();
      this.markMessagesAsRead();
      this.startPolling();
    }
  }

  loadMessages(): void {
    if (!this.patientId || !this.doctorId) return;
    this.chatService.getChatHistory(this.patientId, this.doctorId).subscribe({
      next: (msgs) => {
        console.log('Patient chat history response:', JSON.stringify(msgs, null, 2));
        this.messages = msgs.map(msg => ({
          ...msg,
          read: msg.sender.id === this.patientId || msg.read || false
        })).reverse(); // Reverse to show latest at bottom
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => console.error('Error loading messages:', err),
    });
  }

  startPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
    this.pollSubscription = interval(5000).subscribe(() => this.loadMessages());
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.patientId || !this.doctorId) return;

    const message: ChatMessage = {
      id: 0,
      sender: { id: this.patientId, username: '', email: '', role: 'patient', active: true },
      receiver: { id: this.doctorId, username: this.doctorName || '', email: '', role: 'doctor', active: true },
      message: this.newMessage,
      timestamp: new Date().toISOString()
    };

    this.chatService.sendMessage(message).subscribe({
      next: (msg) => {
        this.messages.unshift(msg); // Add new message at the top (reverse order)
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => console.error('Error sending message:', err.message || err)
    });
  }

  scrollToBottom(): void {
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  markMessagesAsRead(): void {
    if (!this.doctorId || !this.patientId) return;
    const unreadMessages = this.messages.filter(msg => msg.receiver.id === this.patientId && !msg.read);
    unreadMessages.forEach(msg => {
      this.chatService.markAsRead(msg.id).subscribe({
        next: () => {
          msg.read = true;
        },
        error: (err) => console.error('Error marking message as read:', err.message || err)
      });
    });
  }

  hasUnreadMessages(doctorId: number): boolean {
    if (!this.patientId || this.doctorId === doctorId) return false;
    return this.messages.some(msg => msg.sender.id === doctorId && msg.receiver.id === this.patientId && !msg.read);
  }

  getAvatarColor(id: number): string {
    const colors = ['#e67e22', '#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f1c40f'];
    return colors[id % colors.length];
  }

  getLastMessage(doctorId: number): string | null {
    const doctorMessages = this.messages.filter(msg => msg.sender.id === doctorId || msg.receiver.id === doctorId);
    return doctorMessages.length > 0 ? doctorMessages[doctorMessages.length - 1].message : null;
  }

  get doctorSpecialty(): string {
    return this.doctors.find(d => d.id === this.doctorId)?.specialty || 'Specialty not available';
  }
}