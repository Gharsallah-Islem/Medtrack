import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Medication } from '../models/medication.model';

@Injectable({
  providedIn: 'root',
})
export class MedicationService {
  private apiUrl = 'http://localhost:8081/api/medications';

  constructor(private http: HttpClient) {}

  getPatientMedications(patientId: number): Observable<Medication[]> {
    return this.http.get<Medication[]>(`${this.apiUrl}/patient/${patientId}`).pipe(
      map(meds =>
        meds.map(med => {
          try {
            const schedules = JSON.parse(med.schedules);
            return {
              ...med,
              startDate: schedules.startDate,
              endDate: schedules.endDate,
              dailyTimes: schedules.dailyTimes.split(',').map((t: string) => t.trim()),
            };
          } catch (e) {
            console.error('Error parsing schedules:', med.schedules, e);
            return med;
          }
        })
      )
    );
  }

  addMedication(medication: Medication): Observable<Medication> {
    return this.http.post<Medication>(this.apiUrl, medication).pipe(
      map(med => {
        try {
          const schedules = JSON.parse(med.schedules);
          return {
            ...med,
            startDate: schedules.startDate,
            endDate: schedules.endDate,
            dailyTimes: schedules.dailyTimes.split(',').map((t: string) => t.trim()),
          };
        } catch (e) {
          console.error('Error parsing schedules:', med.schedules, e);
          return med;
        }
      })
    );
  }

  checkInteractions(currentMeds: string[], newMed: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/interactions`, { currentMeds, newMed });
  }

  removeMedication(medicationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${medicationId}`);
  }
}