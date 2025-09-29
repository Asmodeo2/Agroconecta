export interface Product {
  id?: number;
  productorId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  unidadMedida: string;
  imagenUrl?: string;
  activo: boolean;
  disponible: boolean;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
}

export interface CreateProductRequest {
  productorId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  unidadMedida: string;
  imagenUrl?: string;
}

export interface UpdateProductRequest {
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
}

export interface UpdatePriceRequest {
  precio: number;
}

export interface UpdateStockRequest {
  stock: number;
}

export interface ProductSearchRequest {
  productorId?: number;
  nombre?: string;
  precioMinimo?: number;
  precioMaximo?: number;
  unidadMedida?: string;
  soloDisponibles?: boolean;
}

export interface ProductStatistics {
  totalProductos: number;
  productosActivos: number;
  productosDisponibles: number;
  productosSinStock: number;
  precioPromedio: number;
  valorTotalInventario: number;
}

// Legacy interfaces for backward compatibility
export interface Producto extends Product {
  categoria?: string;
  productorNombre?: string;
}

export interface ProductoDTO extends Product {
  categoria?: string;
  productorNombre?: string;
}

export interface CrearProductoRequest {
  productorId?: number;
  nombre: string;
  descripcion: string;
  categoria?: string;
  precio: string;
  stock: string;
  unidadMedida: string;
  imagenUrl?: string;
}

export interface ProductoRequest {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  unidadMedida: string;
  categoria?: string;
  imagenUrl?: string;
}