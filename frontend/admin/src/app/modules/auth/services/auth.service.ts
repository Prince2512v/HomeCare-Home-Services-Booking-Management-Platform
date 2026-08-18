import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService, ApiService } from '@services';
import { ROUTES, API_ROUTES } from '@constants';
import { ApiResponse } from '@models';
import {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@authModels';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  login(payload: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.apiService.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, payload);
  }

  refresh(): Observable<ApiResponse<LoginResponse>> {
    return this.apiService.post<LoginResponse>(API_ROUTES.AUTH.REFRESH, {});
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<ApiResponse<ForgotPasswordResponse>> {
    return this.apiService.post<ForgotPasswordResponse>(API_ROUTES.AUTH.FORGOT_PASSWORD, payload);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<ApiResponse<ResetPasswordResponse>> {
    return this.apiService.post<ResetPasswordResponse>(API_ROUTES.AUTH.RESET_PASSWORD, payload);
  }

  validateResetToken(token: string): Observable<ApiResponse<null>> {
    return this.apiService.get<null>(`${API_ROUTES.AUTH.VALIDATE_RESET_TOKEN}?token=${token}`);
  }

  logout(): void {
    this.apiService.post(API_ROUTES.AUTH.LOGOUT, {}).subscribe({ error: () => {} });
    this.sessionService.clearAll();
    this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
  }

  isLoggedIn(): boolean {
    return this.sessionService.isLoggedIn();
  }
}
