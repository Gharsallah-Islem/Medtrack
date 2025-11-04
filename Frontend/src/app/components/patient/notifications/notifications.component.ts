import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { Notification } from '../../../models/notification.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit, AfterViewInit {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const patientId = this.authService.getCurrentUserId();
    if (patientId) {
      this.notificationService.getPatientNotifications(patientId).subscribe({
        next: (nots) =>
        (this.notifications = nots.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        )),
        error: (err) => console.error('Error loading notifications:', err),
      });
    }
  }

  ngAfterViewInit(): void {
    AOS.init({ duration: 1000, once: true });
    VanillaTilt.init(Array.from(document.querySelectorAll('[data-tilt]') as NodeListOf<HTMLElement>), {
      max: 15,
      speed: 400,
      glare: true,
      'max-glare': 0.5,
    });
  }
}