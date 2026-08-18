import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services';
import { AuthService } from '@authservices';
import { ROUTES } from '@constants';
import { map, catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const AuthGuard: CanActivateFn = () => {
  const ts     = inject(SessionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (ts.isLoggedIn()) return true;

  return authService.refresh().pipe(
    map((res) => {
      ts.markLoggedIn();
      if (res.data) {
        ts.setCurrentUser(res.data.id, res.data.isSuperAdmin);
      }
      return true;
    }),
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        ts.clearAll();
        router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
      }
      return of(false);
    })
  );
};