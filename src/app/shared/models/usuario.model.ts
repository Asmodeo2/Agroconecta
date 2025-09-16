export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'PRODUCTOR' | 'ADMINISTRADOR';
  activo?: boolean;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
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

export interface RegisterRequest {
  nombre: string;
  email: string;
  telefono?: string;
  password: string;
  confirmPassword: string;
  rol: 'PRODUCTOR' | 'ADMINISTRADOR';
}