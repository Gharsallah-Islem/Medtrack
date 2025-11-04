import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import jsPDF from 'jspdf';
import * as AOS from 'aos';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-report-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-upload.component.html',
  styleUrls: ['./report-upload.component.css'],
})
export class ReportUploadComponent implements AfterViewInit {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  doctorId: number = 0;
  patientId: number | null = null;
  doctors: User[] = [];
  filteredDoctors: User[] = [];
  selectedDoctor: User | null = null;
  searchQuery: string = '';
  showDropdown: boolean = false;
  errorMessage: string | null = null;
  isUploading: boolean = false;
  isDarkMode: boolean = false;

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.patientId = this.authService.getCurrentUserId();
  }

  ngAfterViewInit(): void {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true });
    this.loadDoctors();
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
  }

  loadDoctors(): void {
    this.userService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.filteredDoctors = doctors;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.errorMessage = 'Failed to load doctors. Please try again.';
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.errorMessage = null;

      // Generate preview URL
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  filterDoctors(): void {
    this.showDropdown = true;
    const query = this.searchQuery.toLowerCase();
    this.filteredDoctors = this.doctors.filter(doctor =>
      (doctor.username && doctor.username.toLowerCase().includes(query)) ||
      (doctor.specialty && doctor.specialty.toLowerCase().includes(query))
    );
  }

  selectDoctor(doctor: User): void {
    this.selectedDoctor = doctor;
    this.doctorId = doctor.id;
    this.searchQuery = `Dr. ${doctor.username}`;
    this.showDropdown = false;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedDoctor = null;
    this.doctorId = 0;
    this.filteredDoctors = this.doctors;
    this.showDropdown = false;
  }

  enhanceImage(): void {
    if (!this.previewUrl) return;

    const img = new Image();
    img.src = this.previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Basic enhancement (brightness/contrast adjustment)
      ctx.filter = 'brightness(110%) contrast(120%)';
      ctx.drawImage(img, 0, 0);

      this.previewUrl = canvas.toDataURL('image/jpeg');
      canvas.toBlob(blob => {
        if (blob) {
          this.selectedFile = new File([blob], this.selectedFile?.name || 'enhanced-report.jpg', { type: 'image/jpeg' });
        }
      }, 'image/jpeg', 0.9);
    };
  }

  uploadReport(): void {
    if (!this.selectedFile || !this.patientId || !this.doctorId) {
      this.errorMessage = 'Please upload a file and select a doctor.';
      return;
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (this.selectedFile.size > maxFileSize) {
      this.errorMessage = 'File size exceeds 10MB. Please upload a smaller file.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;

    const pdf = new jsPDF();
    const img = new Image();
    img.src = URL.createObjectURL(this.selectedFile);
    img.onload = () => {
      const maxWidth = 190;
      const maxHeight = 277;
      let width = img.width;
      let height = img.height;
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;

      pdf.addImage(img, 'JPEG', 10, 10, width, height, undefined, 'FAST');
      const pdfBlob = pdf.output('blob');

      const reportData = new FormData();
      reportData.append('file', this.selectedFile!, this.selectedFile!.name);
      reportData.append('pdfFile', pdfBlob, 'report.pdf');
      reportData.append('patientId', this.patientId!.toString());
      reportData.append('doctorId', this.doctorId.toString());

      this.reportService.uploadReport(reportData).subscribe({
        next: (response) => {
          this.isUploading = false;
          this.errorMessage = null;
          alert(response.message || 'Report uploaded and sent successfully!');
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploading = false;
          if (err.status === 0) {
            this.errorMessage = 'Connection error. Please check your network or try again later.';
          } else if (err.status === 413) {
            this.errorMessage = 'File size too large. Please upload a file smaller than 10MB.';
          } else if (err.error?.error) {
            this.errorMessage = err.error.error;
          } else {
            this.errorMessage = 'Failed to upload report: ' + (err.message || 'Unknown error.');
          }
        },
      });
    };
  }

  resetForm(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.doctorId = 0;
    this.selectedDoctor = null;
    this.searchQuery = '';
    this.filteredDoctors = this.doctors;
    this.showDropdown = false;
    this.errorMessage = null;
    this.isUploading = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.selection-bar') && !target.closest('.autocomplete-dropdown')) {
      this.showDropdown = false;
    }
  }
}