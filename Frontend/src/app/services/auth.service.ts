import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string): Observable<string> {
    console.log('Logging in with identifier:', identifier);
    return this.http
      .post(`${this.apiUrl}/login`, { identifier, password }, { responseType: 'text' })
      .pipe(
        tap((response: string) => {
          if (response.startsWith('eyJ')) {
            console.log('Login successful, storing token');
            localStorage.setItem(this.tokenKey, response);
            const decoded = jwtDecode(response);
            console.log('Decoded token:', decoded);
          } else {
            console.log('Login failed, response:', response);
            throw new Error(response);
          }
        })
      );
  }

  signup(username: string, password: string, email: string, role: string): Observable<any> {
    const body = { username, password, email, role };
    const url = `${this.apiUrl}/signup`;
    console.log('Sending signup request to:', url, 'with body:', body);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'text/plain, application/json' // Accept both text and JSON
    });

    // Use responseType: 'text' to handle plain text responses
    return this.http.post(url, body, { headers, responseType: 'text' }).pipe(
      tap(response => {
        console.log('Signup response:', response);
        // Optionally parse as JSON if possible
        let parsedResponse = response;
        try {
          parsedResponse = JSON.parse(response);
          console.log('Parsed JSON response:', parsedResponse);
        } catch (e) {
          console.log('Response is not JSON, using as text:', response);
        }
        return parsedResponse;
      }),
      catchError(err => {
        console.error('Signup HTTP error:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });
        throw err;
      })
    );
  }

  verifyEmail(email: string, code: string): Observable<any> {
    const url = `${this.apiUrl}/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
    console.log('Sending verify request to:', url);
    return this.http.post(url, null).pipe(
      catchError((error) => {
        console.error('Verify HTTP error:', error, 'Response:', error.error);
        return throwError(() => error);
      })
    );
  }



  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getUserRole(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('Decoded token for role:', decoded);
        return decoded.role || null;
      } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
      }
    }
    return null;
  }

  // Updated to decode userId from token
  getCurrentUserId(): number | null {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('Decoded token for userId:', decoded);
        const userId = decoded.userId; // Match backend claim "userId"
        return userId ? parseInt(userId, 10) : null;
      } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
      }
    }
    return null;
  }

  // Removed getUserId() since we’re decoding locally now
  // If you still need it for other purposes, keep it as a fallback

  getCurrentUser(): any {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded;
      } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
      }
    }
    return null;
  }
}