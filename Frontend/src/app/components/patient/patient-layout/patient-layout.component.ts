import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';
import * as AOS from 'aos';

interface ChatMessage {
  sender: 'user' | 'assistant';
  message: string;
}

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule, CdkDrag],
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.css'],
})
export class PatientLayoutComponent implements OnInit {
  isDarkMode: boolean = false;
  isSidebarOpen: boolean = false;
  isChatOpen: boolean = false;
  isChatMinimized: boolean = false;
  chatMessages: ChatMessage[] = [];
  AIQuestion: string = '';
  AILoading: boolean = false;
  @ViewChild('chatBody') chatBody!: ElementRef;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true });
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    const user = this.authService.getCurrentUser();
    this.chatMessages = [{ sender: 'assistant', message: `Hello ${user?.sub || 'Patient'}, I'm your Health Assistant. How can I help you today?` }];
  }

  toggleSidebar(event: Event): void {
    event.stopPropagation();
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnClickOutside(event: Event): void {
    if (this.isSidebarOpen && !(event.target as HTMLElement).closest('.sidebar')) {
      this.isSidebarOpen = false;
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen && this.isChatMinimized) this.isChatMinimized = false;
    if (this.isChatOpen) setTimeout(() => this.scrollChatToBottom(), 0);
  }

  toggleMinimize(): void {
    this.isChatMinimized = !this.isChatMinimized;
    if (!this.isChatMinimized) setTimeout(() => this.scrollChatToBottom(), 0);
  }

  handleAIQuestion(): void {
    if (!this.AIQuestion.trim() || this.AILoading) return;

    this.chatMessages.push({ sender: 'user', message: this.AIQuestion });
    this.AILoading = true;
    this.AIQuestion = '';
    this.scrollChatToBottom();

    // Simulate AI response (replace with real API call)
    setTimeout(() => {
      this.chatMessages.push({ sender: 'assistant', message: 'This is a simulated response based on your input. Please consult a doctor for personalized advice.' });
      this.AILoading = false;
      this.scrollChatToBottom();
    }, 1200);
  }

  startVoiceInput(): void {
    // Placeholder for voice input (e.g., Web Speech API integration)
    alert('Voice input feature is under development.');
  }

  scrollChatToBottom(): void {
    if (this.chatBody && this.chatBody.nativeElement) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isChatOpen) {
      this.toggleChat();
    }
  }
}