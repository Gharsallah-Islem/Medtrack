export interface Report {
  id: number;
  patient: { id: number; username: string };
  doctor: { id: number; username: string };
  filePath: string;
  enhancedFilePath?: string;
  pdfPath: string;
  sentStatus: 'pending' | 'sent' | 'failed' | 'reviewed';
  sentAt: string;
}