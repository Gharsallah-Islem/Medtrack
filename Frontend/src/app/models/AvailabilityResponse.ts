export interface AvailabilityResponse {
    id: number;
    doctor: { id: number; username: string; role: string };
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm:ss
    endTime: string; // HH:mm:ss
    version: number;
    appointmentSlots: AppointmentSlot[];
}

// models/AvailabilityResponse.ts
export interface AppointmentSlot {
    id: number;
    slotStartTime: string;
    slotEndTime: string;
    booked: boolean;
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
}