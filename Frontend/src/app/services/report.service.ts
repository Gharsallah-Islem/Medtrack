import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = 'http://localhost:8081/api/reports';

  constructor(private http: HttpClient) { }

  uploadReport(reportData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, reportData);
  }

  getDoctorReports(doctorId: number): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

 
}