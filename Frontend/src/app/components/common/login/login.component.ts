import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import AOS from 'aos';
import { ParticlesConfig } from './particles-config';
import { HeaderComponent } from '../header/header.component';

declare const particlesJS: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  particlesConfig = ParticlesConfig;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    AOS.init({ duration: 1000, once: true });
  }

  ngAfterViewInit(): void {
    particlesJS('particles', this.particlesConfig);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      console.log('Login form invalid:', this.loginForm.value);
      return;
    }

    const identifier = this.loginForm.get('username')!.value;
    const password = this.loginForm.get('password')!.value;
    console.log('Login submitted:', { identifier, password });
    this.authService.login(identifier, password).subscribe({
      next: () => {
        const role = this.authService.getUserRole();
        if (role) {
          const roleLower = role.toLowerCase(); // Convert to lowercase for routing
          console.log('Login successful, role:', roleLower);
          this.router.navigate([`/${roleLower}/dashboard`]);
        } else {
          console.error('Role not found in token');
          this.errorMessage = 'Role not found in token';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Login failed';
        console.error('Login error:', err);
      },
    });
  }

  navigateToForgotPassword(): void {
    alert('Forgot password functionality to be implemented.');
  }
}