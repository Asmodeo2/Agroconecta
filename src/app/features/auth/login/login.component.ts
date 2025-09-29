import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest, ApiLoginResponse } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials: LoginRequest = this.loginForm.value;

      // Usar el servicio de autenticación real con tu backend
      this.authService.login(credentials).subscribe({
        next: (response: ApiLoginResponse) => {
          this.loading = false;
          this.snackBar.open(`Bienvenido ${response.user.nombre}`, 'Cerrar', { duration: 3000 });
          // Redirigir según el rol del usuario
          this.redirectByRole(response.user.rol);
        },
        error: (error) => {
          this.loading = false;
          const errorMessage = error.error?.message || 'Email o contraseña incorrectos';
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private redirectByRole(role: string): void {
    switch (role) {
      case 'ADMINISTRADOR':
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'PRODUCTOR':
        this.router.navigate(['/productor/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);

    if (control?.hasError('required')) {
      return `${this.getFieldName(field)} es requerido`;
    }

    if (control?.hasError('email')) {
      return 'Email inválido';
    }

    if (control?.hasError('minlength')) {
      return `${this.getFieldName(field)} debe tener al menos 6 caracteres`;
    }

    return '';
  }

  private getFieldName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      email: 'Email',
      password: 'Contraseña'
    };
    return fieldNames[field] || field;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}