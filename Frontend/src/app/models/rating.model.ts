export interface Rating {
    id?: number; // Optional, ignored by backend
    patient: { id: number ,username?: string}; // Matches backend's User object
    doctor: { id: number , username?: string}; // Matches backend's User object
    rating: number;
    review?: string;
    createdAt?: string | Date; // Optional, ignored by backend
}