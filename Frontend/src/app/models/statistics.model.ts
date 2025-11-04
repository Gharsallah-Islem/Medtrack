export interface Statistics {
    id: number;
    patientId?: number; // Optional for system-wide stats
    dataType: string; // e.g., 'user_registrations', 'appointments', 'blood_pressure', 'engagement_score'
    value: string; // JSON string for complex data, e.g., { "count": 10, "role": "patient" }
    date: string; // ISO date string
    metadata?: { [key: string]: string }; // For filtering, e.g., { "role": "patient", "status": "completed" }
}