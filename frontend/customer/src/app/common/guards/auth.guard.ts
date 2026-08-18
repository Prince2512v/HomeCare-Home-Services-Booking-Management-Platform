import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@auth';
import { ROUTES } from '@constants';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.refreshToken().pipe(
    map(() => true),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        authService.clearSession();
        return of(router.createUrlTree([ROUTES.CUSTOMER.SIGN_IN.SIGN_IN_ABSOLUTE]));
      }
      return of(false);
    }),
  );
};