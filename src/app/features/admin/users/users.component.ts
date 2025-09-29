import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, UserStatistics } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  currentUser: User | null = null;
  showModal = false;
  showDeleteModal = false;
  showPasswordModal = false;
  editingUser: User | null = null;
  userToDelete: User | null = null;
  userToChangePassword: User | null = null;
  userForm: FormGroup;
  passwordForm: FormGroup;
  searchTerm = '';
  selectedRole = '';
  selectedStatus = 'all';
  loading = false;
  error = '';
  statistics: UserStatistics | null = null;

  // Opciones para filtros
  availableRoles = this.userService.getAvailableRoles();
  userRoles = Object.values(UserRole);

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      rol: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.getCurrentUser();
    this.loadUsers();
    this.loadStatistics();
  }

  getCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
  }

  loadUsers() {
    this.loading = true;
    this.error = '';

    this.userService.getActiveUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  loadStatistics() {
    this.userService.getUserStatistics().subscribe({
      next: (stats) => this.statistics = stats,
      error: (error) => console.error('Error loading statistics:', error)
    });
  }

  applyFilters() {
    let filtered = [...this.users];

    // Filtro por término de búsqueda (nombre o email)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nombre.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    // Filtro por rol
    if (this.selectedRole) {
      filtered = filtered.filter(user => user.rol === this.selectedRole);
    }

    // Filtro por estado
    if (this.selectedStatus === 'active') {
      filtered = filtered.filter(user => user.activo);
    } else if (this.selectedStatus === 'inactive') {
      filtered = filtered.filter(user => !user.activo);
    }

    this.filteredUsers = filtered.sort((a, b) =>
      new Date(b.fechaRegistro || '').getTime() - new Date(a.fechaRegistro || '').getTime()
    );
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  openModal(user?: User) {
    this.editingUser = user || null;
    this.showModal = true;

    if (user) {
      this.userForm.patchValue({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono || '',
        rol: user.rol
      });
      // Quitar la validación de password para edición
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.reset();
      // Restaurar validación de password para creación
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = null;
    this.userForm.reset();
  }

  async saveUser() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;

      // Verificar disponibilidad del email si es un nuevo usuario o cambió el email
      if (!this.editingUser || (this.editingUser && this.editingUser.email !== formValue.email)) {
        const emailAvailable = await this.checkEmailAvailability(formValue.email);
        if (!emailAvailable) {
          this.error = 'El email ya está en uso';
          return;
        }
      }

      if (this.editingUser) {
        // Actualizar usuario existente
        const updateData: UpdateUserRequest = {
          nombre: formValue.nombre,
          telefono: formValue.telefono || undefined
        };

        this.userService.updateUser(this.editingUser.id!, updateData).subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
          },
          error: (error) => {
            this.error = 'Error al actualizar usuario';
            console.error('Error updating user:', error);
          }
        });
      } else {
        // Crear nuevo usuario
        const createData: CreateUserRequest = {
          nombre: formValue.nombre,
          email: formValue.email,
          telefono: formValue.telefono || undefined,
          rol: formValue.rol,
          password: formValue.password
        };

        this.userService.createUser(createData).subscribe({
          next: () => {
            this.loadUsers();
            this.loadStatistics();
            this.closeModal();
          },
          error: (error) => {
            this.error = 'Error al crear usuario';
            console.error('Error creating user:', error);
          }
        });
      }
    }
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      return await this.userService.checkEmailAvailability(email).toPromise() || false;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return false;
    }
  }

  confirmDelete(user: User) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  deleteUser() {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id!).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
          this.showDeleteModal = false;
          this.userToDelete = null;
        },
        error: (error) => {
          this.error = 'Error al eliminar usuario';
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  toggleUserStatus(user: User) {
    if (user.activo) {
      this.userService.deactivateUser(user.id!).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error) => console.error('Error deactivating user:', error)
      });
    } else {
      this.userService.activateUser(user.id!).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error) => console.error('Error activating user:', error)
      });
    }
  }

  openPasswordModal(user: User) {
    this.userToChangePassword = user;
    this.showPasswordModal = true;
    this.passwordForm.reset();
  }

  closePasswordModal() {
    this.showPasswordModal = false;
    this.userToChangePassword = null;
    this.passwordForm.reset();
  }

  changePassword() {
    if (this.passwordForm.valid && this.userToChangePassword) {
      const { currentPassword, newPassword } = this.passwordForm.value;

      const changeRequest: ChangePasswordRequest = {
        currentPassword,
        newPassword
      };

      this.userService.changePassword(this.userToChangePassword.id!, changeRequest).subscribe({
        next: () => {
          this.closePasswordModal();
        },
        error: (error) => {
          this.error = 'Error al cambiar contraseña';
          console.error('Error changing password:', error);
        }
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  getRoleDisplayName(role: UserRole | string): string {
    return this.userService.getRoleDisplayName(role);
  }

  getRoleColor(role: UserRole | string): string {
    return this.userService.getRoleColor(role);
  }

  getRoleIcon(role: UserRole | string): string {
    return this.userService.getRoleIcon(role);
  }

  getUserInitials(user: User): string {
    return this.userService.getUserInitials(user);
  }

  formatDate(date: Date | string): string {
    return this.userService.formatDate(date);
  }

  getDaysActive(fechaRegistro: Date | string): number {
    return this.userService.getDaysActive(fechaRegistro);
  }

  canEditUser(user: User): boolean {
    if (!this.currentUser) return false;
    return this.userService.canEditUser(this.currentUser, user);
  }

  canDeleteUser(user: User): boolean {
    if (!this.currentUser) return false;
    return this.userService.canDeleteUser(this.currentUser, user);
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
    this.selectedRole = '';
    this.selectedStatus = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  validatePasswordStrength(password: string): { valid: boolean; message: string } {
    return this.userService.validatePassword(password);
  }

  onPasswordInput() {
    const password = this.userForm.get('password')?.value;
    if (password) {
      const validation = this.validatePasswordStrength(password);
      if (!validation.valid) {
        this.userForm.get('password')?.setErrors({ weakPassword: validation.message });
      } else {
        this.userForm.get('password')?.setErrors(null);
      }
    }
  }
}