import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket$!: WebSocketSubject<any>;

    connect(): Observable<Notification> {
        this.socket$ = webSocket('ws://localhost:4200'); 
        return this.socket$.asObservable();
    }

    disconnect(): void {
        if (this.socket$) this.socket$.complete();
    }
}