import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { SessionService, ApiService } from '@services';
import { ROUTES, API_ROUTES } from '@constants';
import { LoginResponse } from '@authModels';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const ts = inject(SessionService);
  const apiService = inject(ApiService);

  const cloned = req.clone({ withCredentials: true });

  const isAuthEndpoint =
    req.url.includes(API_ROUTES.AUTH.LOGIN) ||
    req.url.includes(API_ROUTES.AUTH.REFRESH) ||
    req.url.includes(API_ROUTES.AUTH.FORGOT_PASSWORD) ||
    req.url.includes(API_ROUTES.AUTH.RESET_PASSWORD);

  const isSkipRefreshEndpoint =
    req.url.includes(API_ROUTES.ADMIN.PROFILE.PASSWORD) ||
    req.url.includes(API_ROUTES.ADMIN_USER.CHANGE_PASSWORD);

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthEndpoint && !isSkipRefreshEndpoint) {
        return apiService.post<LoginResponse>(API_ROUTES.AUTH.REFRESH, {}).pipe(
          switchMap(() => next(cloned)),
          catchError((refreshErr: HttpErrorResponse) => {
            if (refreshErr.status === 401) {
              ts.clearAll();
              router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
            }
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};