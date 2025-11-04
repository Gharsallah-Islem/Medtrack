// models/appointment.model.ts
export interface Appointment {
  id: number;
  patient: {
      id: number;
      username: string;
      email: string;
      role: string;
      specialty?: string | null;
      location?: string | null;
      verificationCode?: string | null;
      active: boolean;
  };
  doctor: {
      id: number;
      username: string;
      email: string;
      role: string;
      specialty?: string | null;
      location?: string | null;
      verificationCode?: string | null;
      active: boolean;
  };
  status: 'pending' | 'approved' | 'completed';
  createdAt: string;
  slot: {
      id: number;
      slotStartTime: string;
      slotEndTime: string;
      patient?: {
          id: number;
          username: string;
          email: string;
          role: string;
          specialty?: string | null;
          location?: string | null;
          verificationCode?: string | null;
          active: boolean;
      };
      status?: 'pending' | 'approved' | 'completed';
      createdAt?: string;
      version?: number;
      booked: boolean;
  };
  doctorName?: string;
  slotStartTime?: string;
}

export interface NewAppointment {
  patientId: number;
  doctorId: number;
  slotId: number;
}