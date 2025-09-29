export interface Order {
  id?: number;
  numeroPedido: string;
  clienteId: number;
  estado: OrderStatus;
  zonaEntrega: string;
  fechaPedido: Date;
  fechaEntregaProgramada?: Date;
  montoTotal: number;
  observaciones?: string;
  detalles: OrderDetail[];
}

export interface OrderDetail {
  id?: number;
  productoId: number;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  clienteId: number;
  zonaEntrega: string;
  fechaEntregaProgramada?: Date;
  observaciones?: string;
  detalles: CreateOrderDetailRequest[];
}

export interface CreateOrderDetailRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface UpdateOrderRequest {
  zonaEntrega: string;
  fechaEntregaProgramada?: Date;
  observaciones?: string;
}

export interface UpdateOrderStatusRequest {
  estado: string;
}

export interface OrderSearchRequest {
  clienteId?: number;
  estado?: string;
  zonaEntrega?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}

export interface OrdersSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  successRate: number;
  cancellationRate: number;
}

export interface OrderStatistics {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosConfirmados: number;
  pedidosEnCamino: number;
  pedidosEntregados: number;
  pedidosCancelados: number;
  montoTotalVentas: number;
  valorPromedioPedido: number;
  tasaExito: number;
  tasaCancelacion: number;
}

export interface DailySales {
  fecha: Date;
  totalVentas: number;
  cantidadPedidos: number;
  valorPromedio: number;
}

export enum OrderStatus {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

// Legacy compatibility
export interface Pedido extends Order {}
export interface DetallePedido extends OrderDetail {}
export interface CrearPedidoRequest extends CreateOrderRequest {}