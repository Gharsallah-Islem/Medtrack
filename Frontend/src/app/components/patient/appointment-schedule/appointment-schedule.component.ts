import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { AvailabilityService } from '../../../services/availability.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { Appointment, NewAppointment } from '../../../models/appointment.model';
import { AppointmentSlot } from '../../../models/AvailabilityResponse';
import { User } from '../../../models/user.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';

@Component({
    selector: 'app-appointment-schedule',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './appointment-schedule.component.html',
    styleUrls: ['./appointment-schedule.component.css'],
})
export class AppointmentScheduleComponent implements OnInit, AfterViewInit {
    appointments: Appointment[] = [];
    slots: AppointmentSlot[] = [];
    doctors: User[] = [];
    newAppointment: NewAppointment = { patientId: 0, doctorId: 0, slotId: 0 };
    patientId: number | null = null;
    selectedDate: string = '';
    isModalOpen: boolean = false;
    selectedDoctor: User | null = null;

    // Filter variables
    filterName: string = '';
    filterSpecialty: string = '';
    filterLocation: string = '';

    // Dark mode state
    isDarkMode: boolean = false;

    constructor(
        private authService: AuthService,
        private appointmentService: AppointmentService,
        private availabilityService: AvailabilityService,
        private userService: UserService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const savedDarkMode = localStorage.getItem('darkMode');
        this.isDarkMode = savedDarkMode === 'true';
        this.patientId = this.authService.getCurrentUserId();
        if (this.patientId) {
            this.newAppointment.patientId = this.patientId;
            this.loadAppointments();
            this.applyFilters(); // Load filtered doctors on init
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

    applyFilters(): void {
        this.appointmentService.getAvailableDoctors(this.filterName, this.filterSpecialty, this.filterLocation).subscribe({
            next: (doctors: User[]) => {
                this.doctors = doctors;
            },
            error: (err: any) => {
                console.error('Error loading filtered doctors:', err);
                alert('Failed to load doctors. Please try again.');
                this.doctors = [];
            },
        });
    }

    loadAppointments(): void {
        this.appointmentService.getPatientAppointments(this.patientId!).subscribe({
            next: (appts) => {
                this.appointments = appts.map((appt: Appointment) => ({
                    ...appt,
                    doctorName: appt.doctor?.username || 'Unknown Doctor',
                    slotStartTime: appt.slot?.slotStartTime
                }));
            },
            error: (err) => {
                console.error('Error loading appointments:', err);
                alert('Failed to load appointments. Please try again.');
            },
        });
    }

    loadDoctorSlots(doctorId: number, date: string): void {
        this.availabilityService.getDoctorSlots(doctorId, date).subscribe({
            next: (slots) => {
                this.slots = slots.filter(slot => !slot.booked);
                console.log('Loaded slots for doctor', doctorId, 'on', date, ':', JSON.stringify(this.slots, null, 2));
            },
            error: (err) => {
                console.error('Error loading slots for doctor', doctorId, ':', err);
                this.slots = [];
            },
        });
    }

    openAppointmentModal(doctorId: number): void {
        this.selectedDoctor = this.doctors.find(doctor => doctor.id === doctorId) || null;
        if (this.selectedDoctor) {
            this.newAppointment.doctorId = doctorId;
            this.newAppointment.slotId = 0;
            this.selectedDate = '';
            this.slots = [];
            this.isModalOpen = true;
        }
    }

    closeModal(event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }
        this.isModalOpen = false;
        this.selectedDoctor = null;
        this.resetNewAppointment();
    }

    scheduleAppointment(): void {
        if (!this.newAppointment.doctorId || !this.newAppointment.slotId || !this.selectedDate) {
            alert('Please select a date and time slot.');
            return;
        }
        this.appointmentService.scheduleAppointment(this.newAppointment).subscribe({
            next: (appt) => {
                this.appointments.push({
                    ...appt,
                    doctorName: appt.doctor?.username || 'Unknown Doctor',
                    slotStartTime: appt.slot?.slotStartTime
                });
                this.closeModal();
                alert('Appointment scheduled successfully!');
            },
            error: (err) => {
                console.error('Error scheduling appointment:', err);
                alert(`Failed to schedule appointment: ${err.error?.message || 'Please try again.'}`);
            },
        });
    }

    cancelAppointment(appointmentId: number): void {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            this.appointmentService.cancelAppointment(appointmentId).subscribe({
                next: () => {
                    this.appointments = this.appointments.filter((appt) => appt.id !== appointmentId);
                    alert('Appointment canceled successfully.');
                },
                error: (err) => {
                    console.error('Error canceling appointment:', err);
                    alert(`Failed to cancel appointment: ${err.error?.message || (err.status === 403 ? 'You are not authorized to cancel this appointment.' : 'Please try again later.')}`);
                },
            });
        }
    }

    resetNewAppointment(): void {
        this.newAppointment = { patientId: this.patientId!, doctorId: 0, slotId: 0 };
        this.slots = [];
        this.selectedDate = '';
    }

    // UI methods
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