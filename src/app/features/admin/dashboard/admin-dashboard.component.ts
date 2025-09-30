import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PedidoService } from '../../../core/services/pedido.service';
import { Order, OrdersSummary } from '../../../shared/models/pedido.model';
import { ProductService } from '../../../core/services/producto.service';
import { UserService } from '../../../core/services/user.service';
import { ClientService } from '../../../core/services/client.service';
import { Router } from '@angular/router';

interface DashboardStats {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosConfirmados: number;
  pedidosEnCamino: number;
  pedidosEntregados: number;
  totalProductos: number;
  totalUsuarios: number;
  totalClientes: number;
  ventasDelMes: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Panel de Administrador</h1>

      <!-- Estadísticas generales -->
      <div class="stats-grid">
        <mat-card class="stat-card orders">
          <mat-card-header>
            <mat-card-title>Total Pedidos</mat-card-title>
            <mat-icon>shopping_cart</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.totalPedidos }}</div>
            <div class="stat-label">Pedidos registrados</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card pending">
          <mat-card-header>
            <mat-card-title>Pendientes</mat-card-title>
            <mat-icon>hourglass_empty</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.pedidosPendientes }}</div>
            <div class="stat-label">Esperando confirmación</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card confirmed">
          <mat-card-header>
            <mat-card-title>Confirmados</mat-card-title>
            <mat-icon>check_circle</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.pedidosConfirmados }}</div>
            <div class="stat-label">Listos para entrega</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card delivered">
          <mat-card-header>
            <mat-card-title>Entregados</mat-card-title>
            <mat-icon>local_shipping</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.pedidosEntregados }}</div>
            <div class="stat-label">Pedidos completados</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card products">
          <mat-card-header>
            <mat-card-title>Productos</mat-card-title>
            <mat-icon>inventory</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.totalProductos }}</div>
            <div class="stat-label">En catálogo</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card users">
          <mat-card-header>
            <mat-card-title>Usuarios</mat-card-title>
            <mat-icon>people</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.totalUsuarios }}</div>
            <div class="stat-label">Usuarios activos</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card clients">
          <mat-card-header>
            <mat-card-title>Clientes</mat-card-title>
            <mat-icon>store</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.totalClientes }}</div>
            <div class="stat-label">Clientes registrados</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card sales">
          <mat-card-header>
            <mat-card-title>Ventas del Mes</mat-card-title>
            <mat-icon>trending_up</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">S/ {{ stats.ventasDelMes | number:'1.2-2' }}</div>
            <div class="stat-label">Ingresos mensuales</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabla de pedidos recientes -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Pedidos Recientes</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="pedidosRecientes" class="pedidos-table">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let pedido">{{ pedido.id }}</td>
            </ng-container>

            <ng-container matColumnDef="cliente">
              <th mat-header-cell *matHeaderCellDef>Cliente ID</th>
              <td mat-cell *matCellDef="let pedido">{{ pedido.clienteId }}</td>
            </ng-container>

            <ng-container matColumnDef="telefono">
              <th mat-header-cell *matHeaderCellDef>Zona</th>
              <td mat-cell *matCellDef="let pedido">{{ pedido.zonaEntrega }}</td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let pedido">S/ {{ pedido.montoTotal | number:'1.2-2' }}</td>
            </ng-container>

            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let pedido">
                <mat-chip
                  [ngClass]="getEstadoClass(pedido.estado)">
                  {{ pedido.estado }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="fechaEntrega">
              <th mat-header-cell *matHeaderCellDef>Fecha Entrega</th>
              <td mat-cell *matCellDef="let pedido">{{ pedido.fechaEntregaProgramada | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let pedido">
                <button mat-icon-button (click)="verDetallePedido(pedido.id)" matTooltip="Ver detalles">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="confirmarPedido(pedido.id)"
                        *ngIf="pedido.estado === 'PENDIENTE'" matTooltip="Confirmar pedido">
                  <mat-icon>check</mat-icon>
                </button>
                <button mat-icon-button (click)="marcarEnCamino(pedido.id)"
                        *ngIf="pedido.estado === 'CONFIRMADO'" matTooltip="Marcar en camino">
                  <mat-icon>local_shipping</mat-icon>
                </button>
                <button mat-icon-button (click)="marcarEntregado(pedido.id)"
                        *ngIf="pedido.estado === 'EN_CAMINO'" matTooltip="Marcar como entregado">
                  <mat-icon>done_all</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #2e7d32;
      margin-bottom: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .stat-card mat-card-header {
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      margin-top: 10px;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
      margin-top: 8px;
    }

    .stat-card.orders .stat-number { color: #1976d2; }
    .stat-card.pending .stat-number { color: #ff9800; }
    .stat-card.confirmed .stat-number { color: #2196f3; }
    .stat-card.delivered .stat-number { color: #4caf50; }
    .stat-card.products .stat-number { color: #9c27b0; }
    .stat-card.users .stat-number { color: #607d8b; }
    .stat-card.clients .stat-number { color: #795548; }
    .stat-card.sales .stat-number { color: #2e7d32; }

    .pedidos-table {
      width: 100%;
      margin-top: 20px;
    }

    .mat-chip.estado-pendiente {
      background-color: #fff3cd;
      color: #856404;
    }

    .mat-chip.estado-confirmado {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .mat-chip.estado-entregado {
      background-color: #d4edda;
      color: #155724;
    }

    .mat-chip.estado-cancelado {
      background-color: #f8d7da;
      color: #721c24;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosConfirmados: 0,
    pedidosEnCamino: 0,
    pedidosEntregados: 0,
    totalProductos: 0,
    totalUsuarios: 0,
    totalClientes: 0,
    ventasDelMes: 0
  };

  loading = true;

  pedidosRecientes: Order[] = [];
  displayedColumns = ['id', 'cliente', 'telefono', 'total', 'estado', 'fechaEntrega', 'acciones'];

  constructor(
    private pedidoService: PedidoService,
    private productService: ProductService,
    private userService: UserService,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.loading = true;

    // Cargar estadísticas de pedidos
    this.pedidoService.getOrdersSummary().subscribe({
      next: (summary: OrdersSummary) => {
        this.stats.totalPedidos = summary.totalOrders || 0;
        this.stats.pedidosPendientes = summary.pendingOrders || 0;
        this.stats.pedidosConfirmados = summary.processingOrders || 0;
        this.stats.pedidosEnCamino = summary.processingOrders || 0;
        this.stats.pedidosEntregados = summary.deliveredOrders || 0;
        this.stats.ventasDelMes = summary.totalRevenue || 0;
      },
      error: (error: any) => console.error('Error al cargar estadísticas de pedidos:', error)
    });

    // Cargar pedidos recientes
    this.pedidoService.getAllOrders(0, 10).subscribe({
      next: (pedidos) => {
        this.pedidosRecientes = pedidos.sort((a, b) =>
          new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()
        );
      },
      error: (error) => console.error('Error al cargar pedidos recientes:', error)
    });

    // Cargar estadísticas de productos
    this.productService.obtenerTodosLosProductos().subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.stats.totalProductos = response.data?.length || 0;
        } else if (Array.isArray(response)) {
          this.stats.totalProductos = response.length;
        }
      },
      error: (error: any) => console.error('Error al cargar productos:', error)
    });

    // Cargar estadísticas de usuarios
    this.userService.getUserStatistics().subscribe({
      next: (userStats) => {
        this.stats.totalUsuarios = userStats.totalUsers || 0;
      },
      error: (error) => console.error('Error al cargar estadísticas de usuarios:', error)
    });

    // Cargar estadísticas de clientes
    this.clientService.getClientStatistics().subscribe({
      next: (clientStats) => {
        this.stats.totalClientes = clientStats.totalClientes || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de clientes:', error);
        this.loading = false;
      }
    });
  }

  confirmarPedido(id: number): void {
    this.pedidoService.confirmOrder(id).subscribe({
      next: () => {
        console.log('Pedido confirmado exitosamente');
        this.cargarDashboard(); // Recargar datos
      },
      error: (error) => console.error('Error al confirmar pedido:', error)
    });
  }

  marcarEnCamino(id: number): void {
    this.pedidoService.markOrderInRoute(id).subscribe({
      next: () => {
        console.log('Pedido marcado como en camino');
        this.cargarDashboard(); // Recargar datos
      },
      error: (error) => console.error('Error al marcar pedido en camino:', error)
    });
  }

  marcarEntregado(id: number): void {
    this.pedidoService.markOrderDelivered(id).subscribe({
      next: () => {
        console.log('Pedido marcado como entregado');
        this.cargarDashboard(); // Recargar datos
      },
      error: (error) => console.error('Error al marcar pedido como entregado:', error)
    });
  }

  getEstadoClass(estado: string): string {
    return `estado-${estado.toLowerCase()}`;
  }

  verDetallePedido(id: number): void {
    this.router.navigate(['/admin/orders', id]);
  }
}