export interface ChatMessage {
  id: number;
  sender: {
    id: number;
    username: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    specialty?: string | null;
    location?: string | null;
    verificationCode?: string | null;
    active: boolean;
  };
  receiver: {
    id: number;
    username: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    specialty?: string | null;
    location?: string | null;
    verificationCode?: string | null;
    active: boolean;
  };
  message: string;
  timestamp: string;
  read?: boolean; // Added to track read status
}