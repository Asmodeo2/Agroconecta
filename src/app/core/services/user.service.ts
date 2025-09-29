import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserSearchRequest,
  UserStatistics,
  UserRole
} from '../../shared/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}


  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, request);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  activateUser(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/activate`, {}, { responseType: 'text' });
  }

  deactivateUser(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {}, { responseType: 'text' });
  }


  changePassword(id: number, request: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/change-password`, request, { responseType: 'text' });
  }


  getActiveUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  getActiveProductors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/productors`);
  }

  getActiveAdministrators(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/administrators`);
  }

  searchUsersByName(name: string): Observable<User[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<User[]>(`${this.apiUrl}/search`, { params });
  }

  getRecentUsers(days: number = 7): Observable<User[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<User[]>(`${this.apiUrl}/recent`, { params });
  }

  searchUsers(request: UserSearchRequest): Observable<User[]> {
    let params = new HttpParams();

    if (request.nombre) {
      params = params.set('nombre', request.nombre);
    }
    if (request.email) {
      params = params.set('email', request.email);
    }
    if (request.rol) {
      params = params.set('rol', request.rol);
    }
    if (request.activo !== undefined) {
      params = params.set('activo', request.activo.toString());
    }

    return this.http.get<User[]>(`${this.apiUrl}/search`, { params });
  }


  checkEmailAvailability(email: string): Observable<boolean> {
    const params = new HttpParams().set('email', email);
    return this.http.get<boolean>(`${this.apiUrl}/check-email`, { params });
  }



  getUserStatistics(): Observable<UserStatistics> {
    return this.http.get<UserStatistics>(`${this.apiUrl}/statistics`);
  }


  getRoleDisplayName(role: UserRole | string): string {
    switch (role) {
      case UserRole.ADMINISTRADOR:
      case 'ADMINISTRADOR':
      case 'ADMIN':
        return 'Administrador';
      case UserRole.PRODUCTOR:
      case 'PRODUCTOR':
        return 'Productor';
      default:
        return role.toString();
    }
  }

  getRoleColor(role: UserRole | string): string {
    switch (role) {
      case UserRole.ADMINISTRADOR:
      case 'ADMINISTRADOR':
      case 'ADMIN':
        return 'danger';
      case UserRole.PRODUCTOR:
      case 'PRODUCTOR':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getRoleIcon(role: UserRole | string): string {
    switch (role) {
      case UserRole.ADMINISTRADOR:
      case 'ADMINISTRADOR':
      case 'ADMIN':
        return 'user-shield';
      case UserRole.PRODUCTOR:
      case 'PRODUCTOR':
        return 'leaf';
      default:
        return 'user';
    }
  }

  getAvailableRoles(): { value: string; label: string; description: string }[] {
    return [
      {
        value: 'ADMINISTRADOR',
        label: 'Administrador',
        description: 'Acceso completo al sistema'
      },
      {
        value: 'PRODUCTOR',
        label: 'Productor',
        description: 'Gestión de productos y pedidos'
      }
    ];
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos una letra minúscula' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos un número' };
    }
    return { valid: true, message: 'Contraseña válida' };
  }

  formatUserName(user: User): string {
    return user.nombre;
  }

  getUserInitials(user: User): string {
    return user.nombre
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDaysActive(fechaRegistro: Date | string): number {
    const today = new Date();
    const registerDate = new Date(fechaRegistro);
    const diffTime = Math.abs(today.getTime() - registerDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  canEditUser(currentUser: User, targetUser: User): boolean {
    // Solo administradores pueden editar usuarios
    if (currentUser.rol !== UserRole.ADMINISTRADOR) {
      return false;
    }

    // Un usuario puede editarse a sí mismo
    if (currentUser.id === targetUser.id) {
      return true;
    }

    // Administradores pueden editar cualquier usuario
    return true;
  }

  canDeleteUser(currentUser: User, targetUser: User): boolean {
    // Solo administradores pueden eliminar usuarios
    if (currentUser.rol !== UserRole.ADMINISTRADOR) {
      return false;
    }

    // No puede eliminarse a sí mismo
    if (currentUser.id === targetUser.id) {
      return false;
    }

    return true;
  }
}