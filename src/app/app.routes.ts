import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'ADMIN'] }
  },
  {
    path: 'admin/clients',
    loadComponent: () => import('./features/admin/clients/clients.component').then(m => m.ClientsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'ADMIN'] }
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./features/admin/products/products.component').then(m => m.ProductsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'ADMIN'] }
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./features/admin/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'ADMIN'] }
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'ADMIN'] }
  },
  {
    path: 'productor/dashboard',
    loadComponent: () => import('./features/productor/dashboard/productor-dashboard.component').then(m => m.ProductorDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PRODUCTOR'] }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./core/components/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];