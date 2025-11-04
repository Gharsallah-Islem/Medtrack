import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MedicationService } from '../../../services/medication.service';
import { AuthService } from '../../../services/auth.service';
import { Medication } from '../../../models/medication.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';

@Component({
  selector: 'app-medication-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medication-list.component.html',
  styleUrls: ['./medication-list.component.css'],
})
export class MedicationListComponent implements OnInit, AfterViewInit {
  medications: Medication[] = [];
  newMedication: Medication = {
    patient: { id: 0 },
    name: '',
    dosage: '',
    frequency: '1 time daily',
    schedules: '{}',
    dailyTimes: ['08:00'],
  };
  interactionWarning: string | null = null;
  dateErrors: { startDate: string; endDate: string } = { startDate: '', endDate: '' };
  timeErrors: string[] = [];
  minDate: string;
  maxDate: string;
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private medicationService: MedicationService,
    private router: Router
  ) {
    const now = new Date();
    const max = new Date();
    max.setDate(now.getDate() + 30);
    this.minDate = this.formatDate(now);
    this.maxDate = this.formatDate(max);
  }

  ngOnInit(): void {
    const savedDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedDarkMode === 'true';
    const patientId = this.authService.getCurrentUserId();
    if (patientId !== null) {
      this.newMedication.patient.id = patientId;
      this.loadMedications(patientId);
    } else {
      console.error('No user ID found in token. User might not be logged in.');
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

  loadMedications(patientId: number): void {
    this.medicationService.getPatientMedications(patientId).subscribe({
      next: (meds) => (this.medications = meds),
      error: (err) => console.error('Error loading medications:', err),
    });
  }

  addMedication(): void {
    const patientId = this.authService.getCurrentUserId();
    if (patientId !== null) {
      this.newMedication.patient.id = patientId;
      this.newMedication.schedules = JSON.stringify({
        startDate: this.newMedication.startDate,
        endDate: this.newMedication.endDate,
        dailyTimes: this.newMedication.dailyTimes.join(',')
      });
      console.log('Sending medication:', JSON.stringify(this.newMedication));
      this.medicationService.addMedication(this.newMedication).subscribe({
        next: (med) => {
          this.medications.push(med);
          alert('Medication added successfully! You’ll receive reminders via Firebase.');
          this.resetNewMedication();
        },
        error: (err) => {
          console.error('Error adding medication:', err);
          alert(err.error?.message || 'Failed to add medication. Please try again.');
        },
      });
    } else {
      console.error('No user ID found in token. Cannot add medication.');
    }
  }

  removeMedication(medicationId: number): void {
    if (confirm('Are you sure you want to remove this medication?')) {
      this.medicationService.removeMedication(medicationId).subscribe({
        next: () => {
          this.medications = this.medications.filter((med) => med.id !== medicationId);
          alert('Medication removed successfully.');
        },
        error: (err) => console.error('Error removing medication:', err),
      });
    }
  }

  resetNewMedication(): void {
    const patientId = this.authService.getCurrentUserId();
    this.newMedication = {
      patient: { id: patientId !== null ? patientId : 0 },
      name: '',
      dosage: '',
      frequency: '1 time daily',
      schedules: '{}',
      dailyTimes: ['08:00'],
    };
    this.dateErrors = { startDate: '', endDate: '' };
    this.timeErrors = [];
    this.interactionWarning = null;
  }

  updateDailyTimes(): void {
    const frequency = this.newMedication.frequency;
    let targetLength = 1;
    let defaultTimes: string[] = ['08:00'];
    if (frequency === '2 times daily') {
      targetLength = 2;
      defaultTimes = ['08:00', '16:00'];
    } else if (frequency === '3 times daily') {
      targetLength = 3;
      defaultTimes = ['08:00', '12:00', '18:00'];
    }
    this.newMedication.dailyTimes = defaultTimes;
    this.timeErrors = Array(targetLength).fill('');
  }

  validateDates(): void {
    const start = this.newMedication.startDate ? new Date(this.newMedication.startDate) : null;
    const end = this.newMedication.endDate ? new Date(this.newMedication.endDate) : null;
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + 30);

    this.dateErrors.startDate = '';
    this.dateErrors.endDate = '';

    if (!start) {
      this.dateErrors.startDate = 'Start date is required.';
    } else if (start < new Date(this.minDate)) {
      this.dateErrors.startDate = 'Start date cannot be in the past.';
    } else if (start > maxDate) {
      this.dateErrors.startDate = 'Start date cannot be more than 30 days in the future.';
    }

    if (!end) {
      this.dateErrors.endDate = 'End date is required.';
    } else if (end < new Date(this.minDate)) {
      this.dateErrors.endDate = 'End date cannot be in the past.';
    } else if (end > maxDate) {
      this.dateErrors.endDate = 'End date cannot be more than 30 days in the future.';
    } else if (start && end && end < start) {
      this.dateErrors.endDate = 'End date must be after start date.';
    }
  }

  validateTime(index: number): void {
    const time = this.newMedication.dailyTimes[index];
    if (!time) {
      this.timeErrors[index] = 'Time is required.';
      return;
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      this.timeErrors[index] = 'Invalid time format (use HH:mm).';
    } else {
      this.timeErrors[index] = '';
    }
  }

  hasErrors(): boolean {
    return (
      !!this.dateErrors.startDate ||
      !!this.dateErrors.endDate ||
      this.timeErrors.some(error => !!error)
    );
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getAvatarColor(id: number): string {
    const colors = ['#e67e22', '#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f1c40f'];
    return colors[id % colors.length];
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}