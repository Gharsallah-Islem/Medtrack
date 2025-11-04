import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
})
export class VerifyEmailComponent implements OnInit {
  email: string = '';
  code: string = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read email from query parameters
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.errorMessage = 'Email is missing. Please sign up again.';
      }
    });
  }

  onSubmit(): void {
    if (!this.email || !this.code) {
      this.errorMessage = 'Please provide both email and verification code.';
      return;
    }
    console.log('Verification submitted:', { email: this.email, code: this.code });
    this.authService.verifyEmail(this.email, this.code).subscribe({
      next: (response) => {
        console.log('Verification successful:', response);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.errorMessage = 'Verification failed. Please check your code.';
        console.error('Verification error:', err);
      },
    });
  }
}