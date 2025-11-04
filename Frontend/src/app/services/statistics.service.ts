// src/app/services/statistics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Statistics } from '../models/statistics.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8081/api/statistics'; // Fixed: removed trailing quote

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getSystemStatistics(): Observable<any> {
    // Dynamic date range: last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0]; // e.g., "2025-05-18"
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    const url = `${this.apiUrl}/admin?startDate=${startDateStr}&endDate=${endDateStr}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }

  getPatientStatistics(patientId: number): Observable<Statistics[]> {
    return this.http.get<Statistics[]>(`${this.apiUrl}/patient/${patientId}`, { headers: this.getAuthHeaders() });
  }

  getDoctorStatistics(doctorId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctor/${doctorId}`, { headers: this.getAuthHeaders() });
  }

  getAdminStatistics(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin?startDate=${startDate}&endDate=${endDate}`, { headers: this.getAuthHeaders() });
  }
}