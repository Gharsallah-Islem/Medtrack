import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../../../services/rating.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { Rating } from '../../../models/rating.model';
import { User } from '../../../models/user.model';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';

@Component({
    selector: 'app-doctor-ratings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './doctor-ratings.component.html',
    styleUrls: ['./doctor-ratings.component.css'],
})
export class DoctorRatingsComponent implements OnInit, AfterViewInit {
    ratings: Rating[] = [];
    newRating: Rating = { patient: { id: 0, }, doctor: { id: 0 }, rating: 0, review: '' };
    patientId: number | null = null;
    doctors: User[] = [];
    isDarkMode: boolean = false;

    constructor(
        private ratingService: RatingService,
        private authService: AuthService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.patientId = this.authService.getCurrentUserId();
        if (this.patientId) {
            this.newRating.patient = { id: this.patientId };
            this.loadDoctors();
            this.loadRatings();
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

    loadDoctors(): void {
        this.userService.getAllDoctors().subscribe({
            next: (doctors) => {
                this.doctors = doctors;
            },
            error: (err) => {
                console.error('Error loading doctors:', err);
                alert('Failed to load doctors.');
            },
        });
    }

    loadRatings(): void {
        this.ratingService.getPatientRatings(this.patientId!).subscribe({
            next: (ratings) => {
                this.ratings = ratings;
            },
            error: (err) => {
                console.error('Error loading ratings:', err);
                alert('Failed to load ratings.');
            },
        });
    }

    submitRating(): void {
        if (!this.newRating.doctor.id) {
            alert('Please select a doctor.');
            return;
        }
        if (this.newRating.rating < 1 || this.newRating.rating > 5) {
            alert('Rating must be between 1 and 5.');
            return;
        }
        this.ratingService.submitRating(this.newRating).subscribe({
            next: (rating) => {
                this.ratings.push({
                    ...rating,
                    doctor: { id: rating.doctor.id }, // Ensure doctor is an object
                    patient: { id: rating.patient.id }, // Ensure patient is an object
                });
                this.resetNewRating();
                alert(`Rated ${rating.doctor.username} by ${rating.patient.username}`);
            },
            error: (err) => {
                console.error('Error submitting rating:', err);
                const errorMessage = err.error?.error || 'Please try again.';
                alert(`Failed to submit rating: ${errorMessage}`);
            },
        });
    }

    resetNewRating(): void {
        this.newRating = { patient: { id: this.patientId! }, doctor: { id: 0 }, rating: 0, review: '' };
    }

    getDoctorName(doctorId: number): string {
        const doctor = this.doctors.find((d) => d.id === doctorId);
        return doctor?.username || 'Unknown';
    }
    getAvatarColor(id: number): string {
        const colors = ['#e67e22', '#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f1c40f'];
        return colors[id % colors.length];
    }
    toggleDarkMode(): void {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode.toString());
    }
}