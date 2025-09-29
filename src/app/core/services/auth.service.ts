import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, delay } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Usuario, LoginRequest, LoginResponse, RegisterRequest, ApiLoginResponse } from '../../shared/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`; 
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<ApiLoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiLoginResponse>(`${this.apiUrl}/login`, credentials, {
      headers,
      withCredentials: true
    }).pipe(
      tap(response => {
        const loginResponse: LoginResponse = {
          token: response.accessToken,
          usuario: response.user,
          expiresIn: 3600 
        };
        this.setSession(loginResponse);
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const expires = localStorage.getItem('token_expires');
    
    if (!token || !expires) {
      return false;
    }
    
    return new Date().getTime() < parseInt(expires);
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSession(authResponse: LoginResponse): void {
    const expiresAt = new Date().getTime() + (authResponse.expiresIn * 1000);
    
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.usuario));
    localStorage.setItem('token_expires', expiresAt.toString());
    
    this.currentUserSubject.next(authResponse.usuario);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr && this.isAuthenticated()) {
      const user = JSON.parse(userStr);
      this.currentUserSubject.next(user);
    }
  }
}