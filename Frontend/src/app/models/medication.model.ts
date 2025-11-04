import { User } from './user.model';
export interface Medication {
  id?: number;
  patient: User;
  name: string;
  dosage: string;
  frequency: '1 time daily' | '2 times daily' | '3 times daily';
  startDate?: string; // e.g., "2025-05-02"
  endDate?: string; // e.g., "2025-05-05"
  dailyTimes: string[]; // e.g., ["08:00", "12:00", "18:00"]
  schedules: string; // JSON string from backend
  createdAt?: string;
}