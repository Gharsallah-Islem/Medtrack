import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Availability } from '../models/availability.model';
import { AvailabilityResponse, AppointmentSlot } from '../models/AvailabilityResponse';

@Injectable({
    providedIn: 'root'
})
export class AvailabilityService {
    private apiUrl = 'http://localhost:8081/api/availability';
    private tokenKey = 'auth_token';

    constructor(private http: HttpClient) { }

    getDoctorSlots(doctorId: number, date: string): Observable<AppointmentSlot[]> {
        const token = localStorage.getItem(this.tokenKey);
        if (!token) {
            console.error('No JWT token found in localStorage for GET');
            return throwError(() => new Error('No JWT token found'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<AppointmentSlot[]>(`${this.apiUrl}/doctor/${doctorId}/slots?date=${date}`, { headers })
            .pipe(
                catchError(err => {
                    console.error('Error fetching slots:', err);
                    return throwError(() => new Error(err.error || 'Failed to fetch slots'));
                })
            );
    }

    addAvailability(availability: Availability): Observable<AvailabilityResponse> {
        const token = localStorage.getItem(this.tokenKey);
        if (!token) {
            console.error('No JWT token found in localStorage for POST');
            return throwError(() => new Error('No JWT token found'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<AvailabilityResponse>(this.apiUrl, availability, { headers })
            .pipe(
                catchError(err => {
                    console.error('Error adding availability:', err);
                    return throwError(() => new Error(err.error || 'Failed to add availability'));
                })
            );
    }
}