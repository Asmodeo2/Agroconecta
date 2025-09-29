import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  UpdatePriceRequest,
  UpdateStockRequest,
  ProductSearchRequest,
  ProductStatistics
} from '../../shared/models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient) {}

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, request);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: number, request: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, request);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  updatePrice(id: number, request: UpdatePriceRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/price`, request, { responseType: 'text' });
  }

  applyDiscount(id: number, discount: number): Observable<string> {
    const params = new HttpParams().set('discount', discount.toString());
    return this.http.put(`${this.apiUrl}/${id}/discount`, {}, { params, responseType: 'text' });
  }

  // ===============================
  // GESTIÓN DE STOCK
  // ===============================

  updateStock(id: number, request: UpdateStockRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/stock`, request, { responseType: 'text' });
  }

  increaseStock(id: number, quantity: number): Observable<string> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.put(`${this.apiUrl}/${id}/stock/increase`, {}, { params, responseType: 'text' });
  }

  reduceStock(id: number, quantity: number): Observable<string> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.put(`${this.apiUrl}/${id}/stock/reduce`, {}, { params, responseType: 'text' });
  }

  checkStockAvailability(id: number, quantity: number): Observable<boolean> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.get<boolean>(`${this.apiUrl}/${id}/stock/check`, { params });
  }

  // ===============================
  // GESTIÓN DE ESTADO
  // ===============================

  activateProduct(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/activate`, {}, { responseType: 'text' });
  }

  deactivateProduct(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {}, { responseType: 'text' });
  }

  // ===============================
  // CONSULTAS Y BÚSQUEDAS
  // ===============================

  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  obtenerTodosLosProductos(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}`);
  }

  getAvailableProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/available`);
  }

  getActiveProductsByProductor(productorId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/producer/${productorId}`);
  }

  searchProducts(request: ProductSearchRequest): Observable<Product[]> {
    // El backend espera query parameters, no body JSON
    let params = new HttpParams();

    if (request.productorId) {
      params = params.set('productorId', request.productorId.toString());
    }
    if (request.nombre) {
      params = params.set('nombre', request.nombre);
    }
    if (request.precioMinimo) {
      params = params.set('precioMinimo', request.precioMinimo.toString());
    }
    if (request.precioMaximo) {
      params = params.set('precioMaximo', request.precioMaximo.toString());
    }
    if (request.unidadMedida) {
      params = params.set('unidadMedida', request.unidadMedida);
    }
    if (request.soloDisponibles !== undefined) {
      params = params.set('soloDisponibles', request.soloDisponibles.toString());
    }

    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params });
  }

  searchProductsByName(name: string): Observable<Product[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Product[]>(`${this.apiUrl}/search/name`, { params });
  }

  getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/price-range`, { params });
  }

  getProductsByUnit(unit: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/unit/${unit}`);
  }

  // ===============================
  // GESTIÓN DE INVENTARIO
  // ===============================

  getLowStockProducts(threshold: number = 10): Observable<Product[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`, { params });
  }

  getOutOfStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/out-of-stock`);
  }

  getRecentProducts(days: number = 7): Observable<Product[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/recent`, { params });
  }

  // ===============================
  // ESTADÍSTICAS
  // ===============================

  getProductStatistics(): Observable<ProductStatistics> {
    return this.http.get<ProductStatistics>(`${this.apiUrl}/statistics`);
  }

  getAvailableUnits(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/units`);
  }

  // ===============================
  // MÉTODOS DE UTILIDAD LOCALES
  // ===============================

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  }

  getStockStatusColor(stock: number, threshold: number = 10): string {
    if (stock === 0) return 'danger';
    if (stock <= threshold) return 'warning';
    return 'success';
  }

  getStockStatusText(stock: number, threshold: number = 10): string {
    if (stock === 0) return 'Sin stock';
    if (stock <= threshold) return 'Stock bajo';
    return 'Disponible';
  }

  calculateInventoryValue(products: Product[]): number {
    return products.reduce((total, product) => total + (product.precio * product.stock), 0);
  }

  // Métodos legacy para compatibilidad
  actualizarProducto(id: number, request: UpdateProductRequest): Observable<Product> {
    return this.updateProduct(id, request);
  }

  crearProducto(request: CreateProductRequest): Observable<Product> {
    return this.createProduct(request);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.deleteProduct(id);
  }
}