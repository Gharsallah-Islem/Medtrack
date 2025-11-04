export interface User {
    id: number;
    username?: string;
    password?: string;
    email?: string;
    role?: 'patient' | 'doctor' | 'admin';
    specialty?: string;
    location?: string;
    isActive?: boolean;
    verificationCode?: string;
    
}
