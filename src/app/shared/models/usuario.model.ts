export interface User {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  activo: boolean;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
}

export interface CreateUserRequest {
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
  password: string;
}

export interface UpdateUserRequest {
  nombre: string;
  telefono?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserSearchRequest {
  nombre?: string;
  email?: string;
  rol?: UserRole;
  activo?: boolean;
}

export interface UserStatistics {
  totalActiveUsers: number;
  totalProductors: number;
  totalAdministrators: number;
  totalInactiveUsers: number;
  totalUsers: number;
}

export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  PRODUCTOR = 'PRODUCTOR',
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  expiresIn: number;
}

export interface ApiLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: Usuario;
  expiresAt: string;
  message: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  telefono?: string;
  password: string;
  confirmPassword: string;
  rol: 'PRODUCTOR' | 'ADMINISTRADOR';
}

// Legacy compatibility
export interface Usuario extends User {
  direccion?: string;
  rol: UserRole;
}

export interface CrearUsuarioRequest extends CreateUserRequest {}