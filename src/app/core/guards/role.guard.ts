import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const user = authService.getCurrentUser();
  if (!user) {
    return router.createUrlTree(['/auth/login']);
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(user.rol);
    if (!hasRole) {
      return router.createUrlTree(['/unauthorized']);
    }
  }

  return true;
};