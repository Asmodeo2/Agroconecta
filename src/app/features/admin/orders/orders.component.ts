import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { ClientService } from '../../../core/services/client.service';
import { ProductService } from '../../../core/services/producto.service';
import { Order, OrderStatus, CreateOrderRequest, UpdateOrderRequest, OrdersSummary } from '../../../shared/models/pedido.model';
import { Client } from '../../../shared/models/cliente.model';
import { Product } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  clients: Client[] = [];
  availableProducts: Product[] = [];
  showModal = false;
  showViewModal = false;
  showDeleteModal = false;
  showStatusModal = false;
  editingOrder: Order | null = null;
  viewingOrder: Order | null = null;
  orderToDelete: Order | null = null;
  orderToUpdateStatus: Order | null = null;
  orderForm: FormGroup;
  statusForm: FormGroup;
  searchTerm = '';
  selectedStatus = '';
  selectedZone = '';
  startDate = '';
  endDate = '';
  loading = false;
  error = '';
  summary: OrdersSummary | null = null;

  // Opciones para filtros
  availableZones: string[] = [];
  orderStatuses = Object.values(OrderStatus);

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  constructor(
    private pedidoService: PedidoService,
    private clientService: ClientService,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      clienteId: ['', Validators.required],
      zonaEntrega: ['', Validators.required],
      fechaEntregaProgramada: [''],
      observaciones: [''],
      detalles: this.fb.array([])
    });

    this.statusForm = this.fb.group({
      estado: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadOrders();
    this.loadClients();
    this.loadAvailableProducts();
  }

  get detallesFormArray() {
    return this.orderForm.get('detalles') as FormArray;
  }

  loadOrders() {
    this.loading = true;
    this.error = '';

    this.pedidoService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.extractAvailableZones();
        this.applyFilters();
        this.loading = false;
        // Cargar resumen después de tener los pedidos
        this.loadSummary();
      },
      error: (error) => {
        this.error = 'Error al cargar pedidos';
        this.loading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  loadClients() {
    this.clientService.getActiveClients().subscribe({
      next: (clients) => this.clients = clients,
      error: (error) => console.error('Error loading clients:', error)
    });
  }

  loadAvailableProducts() {
    this.productService.getAvailableProducts().subscribe({
      next: (products) => this.availableProducts = products,
      error: (error) => console.error('Error loading products:', error)
    });
  }

  loadSummary() {
    this.pedidoService.getOrdersSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (error) => console.error('Error loading summary:', error)
    });
  }

  extractAvailableZones() {
    const zones = [...new Set(this.orders.map(order => order.zonaEntrega))];
    this.availableZones = zones.filter(zone => zone);
  }

  applyFilters() {
    let filtered = [...this.orders];

    // Filtro por término de búsqueda (número de pedido o cliente)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.numeroPedido.toLowerCase().includes(term) ||
        order.clienteId.toString().includes(term)
      );
    }

    // Filtro por estado
    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.estado === this.selectedStatus);
    }

    // Filtro por zona
    if (this.selectedZone) {
      filtered = filtered.filter(order => order.zonaEntrega === this.selectedZone);
    }

    // Filtro por rango de fechas
    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter(order => new Date(order.fechaPedido) >= start);
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      filtered = filtered.filter(order => new Date(order.fechaPedido) <= end);
    }

    this.filteredOrders = filtered.sort((a, b) =>
      new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()
    );
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedOrders() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  openModal(order?: Order) {
    this.editingOrder = order || null;
    this.showModal = true;

    if (order) {
      this.orderForm.patchValue({
        clienteId: order.clienteId,
        zonaEntrega: order.zonaEntrega,
        fechaEntregaProgramada: order.fechaEntregaProgramada ?
          new Date(order.fechaEntregaProgramada).toISOString().split('T')[0] : '',
        observaciones: order.observaciones || ''
      });

      // Cargar detalles existentes
      this.detallesFormArray.clear();
      order.detalles.forEach(detail => {
        this.addDetailFormGroup(detail.productoId, detail.cantidad, detail.precioUnitario);
      });
    } else {
      this.orderForm.reset();
      this.detallesFormArray.clear();
      this.addDetailFormGroup();
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingOrder = null;
    this.orderForm.reset();
    this.detallesFormArray.clear();
  }

  openViewModal(order: Order) {
    this.viewingOrder = order;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewingOrder = null;
  }

  addDetailFormGroup(productoId?: number, cantidad?: number, precioUnitario?: number) {
    const detailGroup = this.fb.group({
      productoId: [productoId || '', Validators.required],
      cantidad: [cantidad || '', [Validators.required, Validators.min(1)]],
      precioUnitario: [precioUnitario || '', [Validators.required, Validators.min(0.01)]]
    });

    // Auto-completar precio cuando se selecciona un producto
    detailGroup.get('productoId')?.valueChanges.subscribe(productId => {
      if (productId) {
        const product = this.availableProducts.find(p => p.id === parseInt(productId.toString()));
        if (product) {
          detailGroup.patchValue({ precioUnitario: product.precio });
        }
      }
    });

    this.detallesFormArray.push(detailGroup);
  }

  removeDetailFormGroup(index: number) {
    this.detallesFormArray.removeAt(index);
  }

  calculateDetailSubtotal(index: number): number {
    const detail = this.detallesFormArray.at(index);
    const cantidad = detail.get('cantidad')?.value || 0;
    const precio = detail.get('precioUnitario')?.value || 0;
    return cantidad * precio;
  }

  calculateTotal(): number {
    let total = 0;
    for (let i = 0; i < this.detallesFormArray.length; i++) {
      total += this.calculateDetailSubtotal(i);
    }
    return total;
  }

  saveOrder() {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;
      const orderData: CreateOrderRequest = {
        clienteId: parseInt(formValue.clienteId),
        zonaEntrega: formValue.zonaEntrega,
        fechaEntregaProgramada: formValue.fechaEntregaProgramada ?
          new Date(formValue.fechaEntregaProgramada) : undefined,
        observaciones: formValue.observaciones || undefined,
        detalles: formValue.detalles.map((detail: any) => ({
          productoId: parseInt(detail.productoId),
          cantidad: parseInt(detail.cantidad),
          precioUnitario: parseFloat(detail.precioUnitario)
        }))
      };

      if (this.editingOrder) {
        // Actualizar pedido existente (solo si está pendiente)
        const updateData: UpdateOrderRequest = {
          zonaEntrega: orderData.zonaEntrega,
          fechaEntregaProgramada: orderData.fechaEntregaProgramada,
          observaciones: orderData.observaciones
        };

        this.pedidoService.updateOrder(this.editingOrder.id!, updateData).subscribe({
          next: () => {
            this.loadOrders();
            this.closeModal();
          },
          error: (error) => {
            this.error = 'Error al actualizar pedido';
            console.error('Error updating order:', error);
          }
        });
      } else {
        // Crear nuevo pedido
        this.pedidoService.createOrder(orderData).subscribe({
          next: () => {
            this.loadOrders();
            this.closeModal();
          },
          error: (error) => {
            this.error = 'Error al crear pedido';
            console.error('Error creating order:', error);
          }
        });
      }
    }
  }

  confirmDelete(order: Order) {
    this.orderToDelete = order;
    this.showDeleteModal = true;
  }

  deleteOrder() {
    if (this.orderToDelete) {
      this.pedidoService.cancelOrder(this.orderToDelete.id!).subscribe({
        next: () => {
          this.loadOrders();
          this.showDeleteModal = false;
          this.orderToDelete = null;
        },
        error: (error) => {
          this.error = 'Error al cancelar pedido';
          console.error('Error cancelling order:', error);
        }
      });
    }
  }

  openStatusModal(order: Order) {
    this.orderToUpdateStatus = order;
    this.showStatusModal = true;
    this.statusForm.patchValue({ estado: order.estado });
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.orderToUpdateStatus = null;
    this.statusForm.reset();
  }

  updateStatus() {
    if (this.statusForm.valid && this.orderToUpdateStatus) {
      const newStatus = this.statusForm.value.estado;

      this.pedidoService.updateOrderStatus(this.orderToUpdateStatus.id!, { estado: newStatus }).subscribe({
        next: () => {
          this.loadOrders();
          this.closeStatusModal();
        },
        error: (error) => {
          this.error = 'Error al actualizar estado';
          console.error('Error updating status:', error);
        }
      });
    }
  }

  quickStatusUpdate(order: Order, newStatus: OrderStatus) {
    this.pedidoService.updateOrderStatus(order.id!, { estado: newStatus }).subscribe({
      next: () => this.loadOrders(),
      error: (error) => console.error('Error updating status:', error)
    });
  }

  getClientName(clienteId: number): string {
    const client = this.clients.find(c => c.id === clienteId);
    return client ? client.nombre : `Cliente #${clienteId}`;
  }

  getProductName(productoId: number): string {
    const product = this.availableProducts.find(p => p.id === productoId);
    return product ? product.nombre : `Producto #${productoId}`;
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDIENTE: return 'status-pending';
      case OrderStatus.CONFIRMADO: return 'status-confirmed';
      case OrderStatus.EN_CAMINO: return 'status-in-route';
      case OrderStatus.ENTREGADO: return 'status-delivered';
      case OrderStatus.CANCELADO: return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDIENTE: return 'Pendiente';
      case OrderStatus.CONFIRMADO: return 'Confirmado';
      case OrderStatus.EN_CAMINO: return 'En Camino';
      case OrderStatus.ENTREGADO: return 'Entregado';
      case OrderStatus.CANCELADO: return 'Cancelado';
      default: return status;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-PE');
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedZone = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 1;
    this.applyFilters();
  }
}