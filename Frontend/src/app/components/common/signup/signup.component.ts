import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import AOS from 'aos';
import { ParticlesConfig } from './particles-config';
import { HeaderComponent } from '../header/header.component';

declare const particlesJS: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, AfterViewInit {
  currentStep = 1;
  particlesConfig = ParticlesConfig;
  signupForm: any;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      occupation: ['', Validators.required],
      emergencyName: ['', Validators.required],
      emergencyNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    AOS.init({ duration: 1000, once: true });
  }

  ngAfterViewInit(): void {
    particlesJS('particles', this.particlesConfig);
  }

  nextStep(step: number): void {
    if (step === 2 && this.isStep1Valid()) {
      this.currentStep = 2;
    } else if (step === 3 && this.isStep2Valid()) {
      this.currentStep = 3;
    } else {
      this.errorMessage = 'Please complete the current step before proceeding.';
      console.log('Step validation failed:', {
        step1: this.isStep1Valid(),
        step2: this.isStep2Valid(),
      });
    }
  }

  isStep1Valid(): boolean {
    return (
      this.signupForm.get('fullName').valid &&
      this.signupForm.get('email').valid &&
      this.signupForm.get('phone').valid
    );
  }

  isStep2Valid(): boolean {
    return (
      this.signupForm.get('dob').valid &&
      this.signupForm.get('gender').valid &&
      this.signupForm.get('occupation').valid
    );
  }

  onSubmit(): void {
    console.log('Form submission triggered');
    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      console.log('Form invalid:', this.signupForm.value);
      return;
    }

    const { fullName, email, password } = this.signupForm.value;
    console.log('Form values:', this.signupForm.value);
    console.log('Sending to authService: username=' + fullName + ', email=' + email + ', password=' + password + ', role=patient');
    this.authService.signup(fullName, password, email, 'patient').subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        // Pass email as query parameter
        this.router.navigate(['/auth/verify-email'], {
          queryParams: { email: email },
        });
      },
      error: (err) => {
        this.errorMessage = 'Signup failed: ' + (err.error?.message || 'Unexpected error');
        console.error('Signup error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          response: err,
        });
      },
    });
  }
}