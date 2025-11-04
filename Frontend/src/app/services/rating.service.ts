import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../models/rating.model';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private apiUrl = 'http://localhost:8081/api/ratings';

  constructor(private http: HttpClient) { }

  getPatientRatings(patientId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  submitRating(rating: Rating): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, rating);
  }
  getDoctorRatings(doctorId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }
}