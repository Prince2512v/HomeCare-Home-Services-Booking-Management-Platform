import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '@services';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.get();

  const authReq = token
    ? req.clone({ withCredentials: true, setHeaders: { Authorization: `Bearer ${token}` } })
    : req.clone({ withCredentials: true });

  return next(authReq).pipe(catchError((error) => throwError(() => error)));
};