import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Appointment, NewAppointment } from '../models/appointment.model';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    private apiUrl = 'http://localhost:8081/api/appointments';
    private tokenKey = 'auth_token';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem(this.tokenKey);
        if (!token) {
            console.error('No JWT token found in localStorage');
            throw new Error('No JWT token found');
        }
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    getPatientAppointments(patientId: number): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.apiUrl}/patient/${patientId}`, { headers: this.getHeaders() });
    }

    getDoctorAppointments(doctorId: number): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.apiUrl}/doctor/${doctorId}`, { headers: this.getHeaders() });
    }

    scheduleAppointment(appointment: NewAppointment): Observable<Appointment> {
        return this.http.post<Appointment>(this.apiUrl, appointment, { headers: this.getHeaders() });
    }

    approveAppointment(appointmentId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${appointmentId}/approve`, {}, { headers: this.getHeaders() });
    }

    cancelAppointment(appointmentId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${appointmentId}`, { headers: this.getHeaders() });
    }

    getAvailableDoctors(name: string, specialty: string, location: string): Observable<User[]> {
        const params = { name, specialty, location };
        return this.http.get<User[]>(`${this.apiUrl}/available-doctors`, { headers: this.getHeaders(), params });
    }
}