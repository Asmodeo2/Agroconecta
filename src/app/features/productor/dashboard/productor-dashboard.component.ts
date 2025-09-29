import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/producto.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductoDTO, CrearProductoRequest } from '../../../shared/models/producto.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-productor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>Panel del Productor</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="abrirFormularioProducto()">
            <mat-icon>add</mat-icon>
            Nuevo Producto
          </button>
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-button">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Resumen de productos -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>Total Productos</mat-card-title>
            <mat-icon>inventory</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ misProductos.length }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>Stock Bajo</mat-card-title>
            <mat-icon>warning</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ productosStockBajo }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>Productos Activos</mat-card-title>
            <mat-icon>check_circle</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ productosActivos }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Lista de productos -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Mis Productos</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="misProductos" class="productos-table">

            <ng-container matColumnDef="imagen">
              <th mat-header-cell *matHeaderCellDef>Imagen</th>
              <td mat-cell *matCellDef="let producto">
                <img [src]="producto.imagenUrl || 'https://via.placeholder.com/150x150/e0e0e0/666666?text=Sin+Imagen'"
                     [alt]="producto.nombre"
                     class="product-image-small"
                     (error)="onImageError($event)">
              </td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Producto</th>
              <td mat-cell *matCellDef="let producto">{{ producto.nombre }}</td>
            </ng-container>

            <ng-container matColumnDef="categoria">
              <th mat-header-cell *matHeaderCellDef>Categoría</th>
              <td mat-cell *matCellDef="let producto">{{ producto.categoria }}</td>
            </ng-container>

            <ng-container matColumnDef="precio">
              <th mat-header-cell *matHeaderCellDef>Precio</th>
              <td mat-cell *matCellDef="let producto">S/ {{ producto.precio | number:'1.2-2' }}</td>
            </ng-container>

            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let producto">
                <span [ngClass]="{'stock-bajo': producto.stock <= 5}">
                  {{ producto.stock }} {{ producto.unidadMedida }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let producto">
                <button mat-icon-button (click)="editarStock(producto)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="editarProducto(producto)">
                  <mat-icon>settings</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="eliminarProducto(producto.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Formulario de producto -->
      <mat-card *ngIf="mostrarFormulario">
        <mat-card-header>
          <mat-card-title>{{ productoEditando ? 'Editar' : 'Nuevo' }} Producto</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="productoForm" (ngSubmit)="guardarProducto()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nombre del producto</mat-label>
                <input matInput formControlName="nombre" placeholder="Ej: Quinua orgánica">
                <mat-error *ngIf="productoForm.get('nombre')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Categoría</mat-label>
                <mat-select formControlName="categoria">
                  <mat-option value="CEREALES">Cereales</mat-option>
                  <mat-option value="VERDURAS">Verduras</mat-option>
                  <mat-option value="FRUTAS">Frutas</mat-option>
                  <mat-option value="TUBERCULOS">Tubérculos</mat-option>
                  <mat-option value="LEGUMBRES">Legumbres</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Precio por unidad</mat-label>
                <input matInput type="number" formControlName="precio" placeholder="0.00">
                <span matPrefix>S/ </span>
                <mat-error *ngIf="productoForm.get('precio')?.hasError('required')">
                  El precio es requerido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Stock disponible</mat-label>
                <input matInput type="number" formControlName="stock" placeholder="100">
                <mat-error *ngIf="productoForm.get('stock')?.hasError('required')">
                  El stock es requerido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Unidad de medida</mat-label>
                <mat-select formControlName="unidadMedida">
                  <mat-option value="kg">Kilogramos</mat-option>
                  <mat-option value="lb">Libras</mat-option>
                  <mat-option value="unidades">Unidades</mat-option>
                  <mat-option value="sacos">Sacos</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="3" placeholder="Describe tu producto..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL de imagen</mat-label>
              <input matInput formControlName="imagenUrl" placeholder="https://ejemplo.com/imagen.jpg">
              <mat-hint>Opcional: URL de una imagen del producto</mat-hint>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelarFormulario()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!productoForm.valid || guardando">
                {{ guardando ? 'Guardando...' : (productoEditando ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
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

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-menu-button {
      color: #2e7d32;
    }

    h1 {
      color: #2e7d32;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-card mat-card-header {
      justify-content: space-between;
      align-items: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #2e7d32;
      margin-top: 10px;
    }

    .productos-table {
      width: 100%;
      margin-top: 20px;
    }

    .stock-bajo {
      color: #d32f2f;
      font-weight: bold;
    }

    .form-row {
      display: flex;
      gap: 20px;
      align-items: start;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    mat-card {
      margin-bottom: 20px;
    }

    .product-image-small {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
  `]
})
export class ProductorDashboardComponent implements OnInit {
  misProductos: ProductoDTO[] = [];
  displayedColumns = ['imagen', 'nombre', 'categoria', 'precio', 'stock', 'acciones'];

  mostrarFormulario = false;
  productoEditando: ProductoDTO | null = null;
  guardando = false;

  productoForm: FormGroup;

  constructor(
    private productoService: ProductService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      unidadMedida: ['kg', [Validators.required]],
      descripcion: [''],
      imagenUrl: ['']
    });
  }

  ngOnInit(): void {
    this.cargarMisProductos();
  }

  get productosStockBajo(): number {
    return this.misProductos.filter(p => p.stock <= 5).length;
  }

  get productosActivos(): number {
    return this.misProductos.filter(p => p.stock > 0).length;
  }

  cargarMisProductos(): void {
    // Cargar productos del productor actual
    this.productoService.obtenerTodosLosProductos().subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.misProductos = response.data || [];
        } else if (Array.isArray(response)) {
          this.misProductos = response;
        } else {
          this.misProductos = [];
        }
        console.log('🐛 Productos cargados:', this.misProductos);
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.mostrarMensaje('Error al cargar productos');
        this.misProductos = [];
      }
    });
  }

  abrirFormularioProducto(): void {
    this.mostrarFormulario = true;
    this.productoEditando = null;
    this.productoForm.reset({
      unidadMedida: 'kg'
    });
  }

  editarProducto(producto: ProductoDTO): void {
    this.mostrarFormulario = true;
    this.productoEditando = producto;
    this.productoForm.patchValue({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      unidadMedida: producto.unidadMedida,
      descripcion: producto.descripcion,
      imagenUrl: producto.imagenUrl
    });
  }

  editarStock(producto: ProductoDTO): void {
    const nuevoStock = prompt(`Stock actual: ${producto.stock}. Ingrese nuevo stock:`);
    if (nuevoStock && !isNaN(Number(nuevoStock))) {
      const currentUser = this.authService.getCurrentUser();

      if (!currentUser) {
        this.mostrarMensaje('Error: Usuario no autenticado');
        return;
      }

      const request: CrearProductoRequest = {
        productorId: currentUser.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        categoria: producto.categoria,
        precio: producto.precio.toString(),
        stock: nuevoStock,
        unidadMedida: producto.unidadMedida || 'kg',
        imagenUrl: producto.imagenUrl || ''
      };

      this.productoService.updateProduct(producto.id!, request).subscribe({
        next: (response: any) => {
          const isSuccess = response?.success !== false;
          if (isSuccess) {
            this.mostrarMensaje('Stock actualizado correctamente');
            this.cargarMisProductos();
          } else {
            this.mostrarMensaje('Error al actualizar stock');
          }
        },
        error: (error: any) => {
          console.error('Error al actualizar stock:', error);
          this.mostrarMensaje('Error al actualizar stock');
        }
      });
    }
  }

  guardarProducto(): void {
    if (this.productoForm.valid) {
      this.guardando = true;
      const formData = this.productoForm.value;
      const currentUser = this.authService.getCurrentUser();

      if (!currentUser) {
        this.mostrarMensaje('Error: Usuario no autenticado');
        this.guardando = false;
        return;
      }

      const request: any = {
        productorId: currentUser.id,
        nombre: formData.nombre,
        descripcion: formData.descripcion || '',
        categoria: formData.categoria,
        precio: formData.precio.toString(),
        stock: formData.stock.toString(),
        unidadMedida: formData.unidadMedida,
        imagenUrl: formData.imagenUrl || ''
      };

      console.log('🐛 Datos enviados al backend:', request);

      const operation = this.productoEditando
        ? this.productoService.updateProduct(this.productoEditando.id!, request)
        : this.productoService.createProduct(request);

      operation.subscribe({
        next: (response: any) => {
          const isSuccess = response?.success !== false;
          if (isSuccess) {
            this.mostrarMensaje(`Producto ${this.productoEditando ? 'actualizado' : 'creado'} correctamente`);
            this.cancelarFormulario();
            this.cargarMisProductos();
          } else {
            this.mostrarMensaje('Error al guardar producto');
          }
        },
        error: (error: any) => {
          console.error('Error al guardar producto:', error);
          this.mostrarMensaje('Error al guardar producto');
        },
        complete: () => {
          this.guardando = false;
        }
      });
    }
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      this.productoService.deleteProduct(id).subscribe({
        next: (response: any) => {
          const isSuccess = response?.success !== false;
          if (isSuccess) {
            this.mostrarMensaje('Producto eliminado correctamente');
            this.cargarMisProductos();
          } else {
            this.mostrarMensaje('Error al eliminar producto');
          }
        },
        error: (error: any) => {
          console.error('Error al eliminar producto:', error);
          this.mostrarMensaje('Error al eliminar producto');
        }
      });
    }
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.productoEditando = null;
    this.productoForm.reset();
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/150x150/e0e0e0/666666?text=Sin+Imagen';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}