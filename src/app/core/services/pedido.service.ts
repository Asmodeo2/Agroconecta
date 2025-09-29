import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
  OrderSearchRequest,
  OrdersSummary,
  OrderStatistics,
  DailySales
} from '../../shared/models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  // ===============================
  // ENDPOINTS BÁSICOS
  // ===============================

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
  }

  updateOrder(id: number, request: UpdateOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, request);
  }

  cancelOrder(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  // ===============================
  // GESTIÓN DE ESTADOS
  // ===============================

  updateOrderStatus(id: number, request: UpdateOrderStatusRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/status`, request, { responseType: 'text' });
  }

  confirmOrder(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/confirm`, {}, { responseType: 'text' });
  }

  markOrderInRoute(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/mark-in-route`, {}, { responseType: 'text' });
  }

  markOrderDelivered(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/mark-delivered`, {}, { responseType: 'text' });
  }

  // ===============================
  // CONSULTAS Y BÚSQUEDAS
  // ===============================

  getAllOrders(page: number = 0, size: number = 1000): Observable<Order[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Order[]>(this.apiUrl, { params });
  }

  getOrdersByClient(clientId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
  }

  getOrdersByDeliveryZone(zone: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/zone/${zone}`);
  }

  getOrdersByDateRange(startDate: Date, endDate: Date): Observable<Order[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);
    return this.http.get<Order[]>(`${this.apiUrl}/date-range`, { params });
  }

  // ===============================
  // REPORTES Y ESTADÍSTICAS
  // ===============================

  getOrdersSummary(): Observable<OrdersSummary> {
    return this.http.get<OrdersSummary>(`${this.apiUrl}/stats/summary`);
  }

  getOrderStatistics(): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${this.apiUrl}/statistics`);
  }

  // ===============================
  // MÉTODOS DE UTILIDAD LOCALES
  // ===============================

  formatOrderNumber(orderNumber: string): string {
    if (orderNumber.startsWith('PED-')) {
      const timestamp = orderNumber.split('-')[1];
      const shortNumber = parseInt(timestamp.slice(-6)) % 1000;
      return `PED-${shortNumber.toString().padStart(3, '0')}`;
    }
    return orderNumber;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDIENTE': return 'warning';
      case 'CONFIRMADO': return 'info';
      case 'EN_CAMINO': return 'primary';
      case 'ENTREGADO': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'secondary';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  }

  canEditOrder(order: Order): boolean {
    return order.estado === 'PENDIENTE';
  }

  canCancelOrder(order: Order): boolean {
    return ['PENDIENTE', 'CONFIRMADO'].includes(order.estado);
  }

  // ===============================
  // LEGACY METHODS FOR COMPATIBILITY
  // ===============================

  obtenerTodosLosPedidos(): Observable<any> {
    return this.getAllOrders();
  }

  obtenerPedidoPorId(id: number): Observable<any> {
    return this.getOrderById(id);
  }

  crearPedido(pedido: any): Observable<any> {
    return this.createOrder(pedido);
  }

  actualizarEstadoPedido(id: number, estado: string): Observable<any> {
    return this.updateOrderStatus(id, { estado });
  }

  cancelarPedido(id: number): Observable<any> {
    return this.cancelOrder(id);
  }

  obtenerEstadisticasPedidos(): Observable<any> {
    return this.getOrderStatistics();
  }
}