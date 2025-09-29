import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../shared/models/cliente.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  showModal = false;
  showDeleteModal = false;
  editingClient: Client | null = null;
  clientToDelete: Client | null = null;
  clientForm: FormGroup;
  searchTerm = '';
  selectedMercado = '';
  selectedTipo = '';
  loading = false;
  error = '';

  // Opciones para filtros
  mercados: string[] = [];
  tiposCliente: string[] = [];

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefonoWhatsapp: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      mercadoZona: ['', Validators.required],
      tipoCliente: ['', Validators.required],
      direccion: [''],
      contactoAdicional: ['']
    });
  }

  ngOnInit() {
    this.loadClients();
    this.loadFilterOptions();
  }

  loadClients() {
    this.loading = true;
    this.error = '';

    this.clientService.getActiveClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar clientes';
        this.loading = false;
        console.error('Error loading clients:', error);
      }
    });
  }

  loadFilterOptions() {
    // Cargar mercados disponibles
    this.clientService.getAvailableMercados().subscribe({
      next: (mercados) => this.mercados = mercados,
      error: (error) => console.error('Error loading mercados:', error)
    });

    // Cargar tipos de cliente disponibles
    this.clientService.getAvailableClientTypes().subscribe({
      next: (tipos) => this.tiposCliente = tipos,
      error: (error) => console.error('Error loading tipos:', error)
    });
  }

  applyFilters() {
    let filtered = [...this.clients];

    // Filtro por término de búsqueda (nombre o WhatsApp)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.nombre.toLowerCase().includes(term) ||
        client.telefonoWhatsapp.includes(term)
      );
    }

    // Filtro por mercado
    if (this.selectedMercado) {
      filtered = filtered.filter(client => client.mercadoZona === this.selectedMercado);
    }

    // Filtro por tipo
    if (this.selectedTipo) {
      filtered = filtered.filter(client => client.tipoCliente === this.selectedTipo);
    }

    this.filteredClients = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedClients() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredClients.slice(startIndex, startIndex + this.itemsPerPage);
  }

  openModal(client?: Client) {
    this.editingClient = client || null;
    this.showModal = true;

    if (client) {
      this.clientForm.patchValue({
        nombre: client.nombre,
        telefonoWhatsapp: client.telefonoWhatsapp,
        mercadoZona: client.mercadoZona,
        tipoCliente: client.tipoCliente,
        direccion: client.direccion || '',
        contactoAdicional: client.contactoAdicional || ''
      });
    } else {
      this.clientForm.reset();
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingClient = null;
    this.clientForm.reset();
  }

  saveClient() {
    if (this.clientForm.valid) {
      const clientData = this.clientForm.value;

      if (this.editingClient) {
        // Actualizar cliente existente
        this.clientService.updateClient(this.editingClient.id!, clientData).subscribe({
          next: () => {
            this.loadClients();
            this.closeModal();
          },
          error: (error) => {
            this.error = 'Error al actualizar cliente';
            console.error('Error updating client:', error);
          }
        });
      } else {
        // Crear nuevo cliente
        this.clientService.createClient(clientData).subscribe({
          next: () => {
            this.loadClients();
            this.closeModal();
          },
          error: (error) => {
            this.error = 'Error al crear cliente';
            console.error('Error creating client:', error);
          }
        });
      }
    }
  }

  confirmDelete(client: Client) {
    this.clientToDelete = client;
    this.showDeleteModal = true;
  }

  deleteClient() {
    if (this.clientToDelete) {
      this.clientService.deleteClient(this.clientToDelete.id!).subscribe({
        next: () => {
          this.loadClients();
          this.showDeleteModal = false;
          this.clientToDelete = null;
        },
        error: (error) => {
          this.error = 'Error al eliminar cliente';
          console.error('Error deleting client:', error);
        }
      });
    }
  }

  toggleClientStatus(client: Client) {
    if (client.activo) {
      this.clientService.deactivateClient(client.id!).subscribe({
        next: () => this.loadClients(),
        error: (error) => console.error('Error deactivating client:', error)
      });
    } else {
      this.clientService.activateClient(client.id!).subscribe({
        next: () => this.loadClients(),
        error: (error) => console.error('Error activating client:', error)
      });
    }
  }

  recordInteraction(client: Client) {
    this.clientService.recordInteraction(client.id!).subscribe({
      next: () => {
        this.loadClients(); // Recargar para actualizar fechas
      },
      error: (error) => console.error('Error recording interaction:', error)
    });
  }

  formatWhatsApp(phone: string): string {
    // Formatear número de WhatsApp para mostrar
    return phone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  }

  getDaysWithoutInteraction(client: Client): number {
    if (!client.fechaUltimaInteraccion) return 0;
    const lastInteraction = new Date(client.fechaUltimaInteraccion);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastInteraction.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getActivityStatus(client: Client): string {
    const days = this.getDaysWithoutInteraction(client);
    if (days === 0) return 'Activo hoy';
    if (days <= 7) return 'Activo';
    if (days <= 30) return 'Poco activo';
    return 'Inactivo';
  }

  getActivityStatusClass(client: Client): string {
    const days = this.getDaysWithoutInteraction(client);
    if (days <= 7) return 'status-active';
    if (days <= 30) return 'status-warning';
    return 'status-inactive';
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
    this.selectedMercado = '';
    this.selectedTipo = '';
    this.currentPage = 1;
    this.applyFilters();
  }
}