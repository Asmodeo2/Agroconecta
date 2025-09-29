import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/producto.service';
import { Product } from '../../../shared/models/producto.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  showModal = false;
  showDeleteModal = false;
  showStockModal = false;
  editingProduct: Product | null = null;
  productToDelete: Product | null = null;
  productToUpdateStock: Product | null = null;
  productForm: FormGroup;
  stockForm: FormGroup;
  searchTerm = '';
  selectedUnit = '';
  selectedStatus = 'all';
  minPrice = '';
  maxPrice = '';
  loading = false;
  error = '';

  // Opciones para filtros
  availableUnits: string[] = [];
  lowStockThreshold = 10;

  // Paginación
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      unidadMedida: ['', Validators.required],
      imagenUrl: ['']
    });

    this.stockForm = this.fb.group({
      stockAction: ['set', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadAvailableUnits();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';

    this.productService.getActiveProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  loadAvailableUnits() {
    this.productService.getAvailableUnits().subscribe({
      next: (units) => this.availableUnits = units,
      error: (error) => console.error('Error loading units:', error)
    });
  }

  applyFilters() {
    let filtered = [...this.products];

    // Filtro por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(term) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(term))
      );
    }

    // Filtro por unidad de medida
    if (this.selectedUnit) {
      filtered = filtered.filter(product => product.unidadMedida === this.selectedUnit);
    }

    // Filtro por estado
    if (this.selectedStatus === 'available') {
      filtered = filtered.filter(product => product.disponible);
    } else if (this.selectedStatus === 'out_of_stock') {
      filtered = filtered.filter(product => product.stock === 0);
    } else if (this.selectedStatus === 'low_stock') {
      filtered = filtered.filter(product => product.stock > 0 && product.stock <= this.lowStockThreshold);
    }

    // Filtro por rango de precio
    if (this.minPrice) {
      filtered = filtered.filter(product => product.precio >= parseFloat(this.minPrice));
    }
    if (this.maxPrice) {
      filtered = filtered.filter(product => product.precio <= parseFloat(this.maxPrice));
    }

    this.filteredProducts = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }


  openModal(product?: Product) {
    this.editingProduct = product || null;
    this.showModal = true;

    if (product) {
      this.productForm.patchValue({
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio: product.precio,
        stock: product.stock,
        unidadMedida: product.unidadMedida,
        imagenUrl: product.imagenUrl || ''
      });
    } else {
      this.productForm.reset();
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  saveProduct() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;

      if (this.editingProduct) {
        // Actualizar producto existente
        this.productService.updateProduct(this.editingProduct.id!, productData).subscribe({
          next: () => {
            this.loadProducts();
            this.closeModal();
          },
          error: (error) => {
            this.error = 'Error al actualizar producto';
            console.error('Error updating product:', error);
          }
        });
      } else {
        // Crear nuevo producto - obtener el ID del usuario actual
        const currentUser = this.authService.getCurrentUser();
        const productorId = currentUser?.id || 1; // Fallback a 1 si no hay usuario
        const createData = { ...productData, productorId };
        this.productService.createProduct(createData).subscribe({
          next: () => {
            this.loadProducts();
            this.closeModal();
          },
          error: (error) => {
            this.error = 'Error al crear producto';
            console.error('Error creating product:', error);
          }
        });
      }
    }
  }

  confirmDelete(product: Product) {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  deleteProduct() {
    if (this.productToDelete) {
      this.productService.deleteProduct(this.productToDelete.id!).subscribe({
        next: () => {
          this.loadProducts();
          this.showDeleteModal = false;
          this.productToDelete = null;
        },
        error: (error) => {
          this.error = 'Error al eliminar producto';
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  openStockModal(product: Product) {
    this.productToUpdateStock = product;
    this.showStockModal = true;
    this.stockForm.patchValue({
      stockAction: 'set',
      quantity: product.stock
    });
  }

  closeStockModal() {
    this.showStockModal = false;
    this.productToUpdateStock = null;
    this.stockForm.reset();
  }

  updateStock() {
    if (this.stockForm.valid && this.productToUpdateStock) {
      const { stockAction, quantity } = this.stockForm.value;
      const productId = this.productToUpdateStock.id!;

      let updateObservable;

      switch (stockAction) {
        case 'set':
          updateObservable = this.productService.updateStock(productId, { stock: quantity });
          break;
        case 'increase':
          updateObservable = this.productService.increaseStock(productId, quantity);
          break;
        case 'reduce':
          updateObservable = this.productService.reduceStock(productId, quantity);
          break;
        default:
          return;
      }

      updateObservable.subscribe({
        next: () => {
          this.loadProducts();
          this.closeStockModal();
        },
        error: (error) => {
          this.error = 'Error al actualizar stock';
          console.error('Error updating stock:', error);
        }
      });
    }
  }

  toggleProductStatus(product: Product) {
    if (product.activo) {
      this.productService.deactivateProduct(product.id!).subscribe({
        next: () => this.loadProducts(),
        error: (error) => console.error('Error deactivating product:', error)
      });
    } else {
      this.productService.activateProduct(product.id!).subscribe({
        next: () => this.loadProducts(),
        error: (error) => console.error('Error activating product:', error)
      });
    }
  }

  applyDiscount(product: Product, discountPercentage: number) {
    this.productService.applyDiscount(product.id!, discountPercentage).subscribe({
      next: () => this.loadProducts(),
      error: (error) => console.error('Error applying discount:', error)
    });
  }

  getStockStatus(product: Product): string {
    if (product.stock === 0) return 'Sin stock';
    if (product.stock <= this.lowStockThreshold) return 'Stock bajo';
    return 'Disponible';
  }

  getStockStatusClass(product: Product): string {
    if (product.stock === 0) return 'status-danger';
    if (product.stock <= this.lowStockThreshold) return 'status-warning';
    return 'status-success';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  }

  // Métodos para búsqueda y filtros
  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedUnit = '';
    this.selectedStatus = 'all';
    this.minPrice = '';
    this.maxPrice = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Getters para templates
  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  get availableProductsCount(): number {
    return this.products.filter(p => p.disponible).length;
  }

  get lowStockProductsCount(): number {
    return this.products.filter(p => p.stock > 0 && p.stock <= this.lowStockThreshold).length;
  }

  get outOfStockProductsCount(): number {
    return this.products.filter(p => p.stock === 0).length;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  quickPriceUpdate(product: Product, newPrice: number) {
    this.productService.updatePrice(product.id!, { precio: newPrice }).subscribe({
      next: () => this.loadProducts(),
      error: (error) => console.error('Error updating price:', error)
    });
  }

  onImageError(event: any) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/150x150/e0e0e0/666666?text=Sin+Imagen';
  }
}