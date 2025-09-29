import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="text-align: center; margin-top: 50px;">
      <h2>Acceso No Autorizado</h2>
      <p>No tienes permisos para acceder a esta página.</p>
      <a routerLink="/auth/login">Volver al login</a>
    </div>
  `
})
export class UnauthorizedComponent {}