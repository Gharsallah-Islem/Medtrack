import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ChatMessage } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:8081/api/chat';

  constructor(private http: HttpClient) { }

  getChatHistory(senderId: number, receiverId: number): Observable<ChatMessage[]> {
    console.log(`Fetching chat history for senderId: ${senderId}, receiverId: ${receiverId}`);
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversation/${senderId}/${receiverId}`).pipe(
      map(messages => messages.map(msg => ({
        ...msg,
        senderId: msg.sender.id,
        receiverId: msg.receiver.id
      })))
    );
  }

  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    const payload = {
      senderId: message.sender.id,
      receiverId: message.receiver.id,
      message: message.message,
      timestamp: message.timestamp
    };
    console.log('Sending payload:', JSON.stringify(payload)); // Log payload for debugging
    return this.http.post<ChatMessage>(this.apiUrl, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error sending message:', error.error || error.message);
        return throwError(() => new Error('Failed to send message: ' + (error.error?.message || error.message)));
      })
    );
  }

  getUnreadMessages(receiverId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/unread/${receiverId}`);
  }

  markAsRead(messageId: number): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.apiUrl}/${messageId}/read`, null);
  }
}