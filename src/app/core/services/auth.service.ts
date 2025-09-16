import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, delay } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Usuario, LoginRequest, LoginResponse, RegisterRequest } from '../../shared/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api'; // Por ahora hardcodeado
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Usuarios simulados para testing
  private mockUsers = [
    {
      email: 'admin@agroconecta.com',
      password: '123456',
      usuario: {
        id: 1,
        nombre: 'Admin AgroConecta',
        email: 'admin@agroconecta.com',
        telefono: '+51987654321',
        rol: 'ADMINISTRADOR' as const,
        activo: true
      }
    },
    {
      email: 'productor@gmail.com',
      password: '123456',
      usuario: {
        id: 2,
        nombre: 'Juan Pérez',
        email: 'productor@gmail.com',
        telefono: '+51912345678',
        rol: 'PRODUCTOR' as const,
        activo: true
      }
    },
    {
      email: 'test@test.com',
      password: '123456',
      usuario: {
        id: 3,
        nombre: 'Usuario de Prueba',
        email: 'test@test.com',
        rol: 'PRODUCTOR' as const,
        activo: true
      }
    }
  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // Login simulado para testing (SIN BACKEND)
  loginMock(credentials: LoginRequest): Observable<LoginResponse> {
    // Buscar usuario en la lista mock
    const foundUser = this.mockUsers.find(
      user => user.email === credentials.email && user.password === credentials.password
    );

    if (foundUser) {
      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        usuario: foundUser.usuario,
        expiresIn: 3600 // 1 hora
      };

      // Simular delay de red (1 segundo)
      return of(mockResponse).pipe(
        delay(2000),
        tap(response => {
          this.setSession(response);
        })
      );
    } else {
      // Simular error de credenciales incorrectas
      return new Observable(observer => {
        setTimeout(() => {
          observer.error({
            status: 401,
            error: { message: 'Email o contraseña incorrectos' }
          });
        }, 1000);
      });
    }
  }

  // Login real (CON BACKEND) - para cuando esté listo
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
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