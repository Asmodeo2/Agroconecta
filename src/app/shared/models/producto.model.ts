export interface Producto {
  id?: number;
  productorId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  unidadMedida: string;
  imagenUrl?: string;
  activo?: boolean;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
  
  // Para mostrar datos del productor
  productorNombre?: string;
}

export interface ProductoRequest {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  unidadMedida: string;
  imagenUrl?: string;
}