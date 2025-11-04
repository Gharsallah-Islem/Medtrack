export interface Notification {
    id: number;
    userId: number;
    message: string;
    type: 'email' | 'in-app'| 'sms'|'info'|'warning'|'error';
    sentAt: string;
    read: boolean;
}