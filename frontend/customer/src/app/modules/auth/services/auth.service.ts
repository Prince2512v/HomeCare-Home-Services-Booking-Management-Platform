import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_ROUTES } from '@constants';
import { ApiResponse } from '@models';
import { ApiService, TokenService } from '@services';
import {
  AuthResponse,
  SendOtpRequest,
  UserResponse,
  VerifyOtpRequest,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private tokenService = inject(TokenService);

  currentUser = signal<UserResponse | null>(null);

  sendOtp(payload: SendOtpRequest): Observable<ApiResponse<null>> {
    return this.api.post<null>(API_ROUTES.OTP.SEND, payload);
  }

  verifyOtp(payload: VerifyOtpRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<AuthResponse>(API_ROUTES.OTP.VERIFY, payload).pipe(
      tap((res) => {
        this.currentUser.set(res.data.user);
        if (res.data.token) this.tokenService.save(res.data.token);
      }),
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<AuthResponse>(API_ROUTES.OTP.REFRESH, {}).pipe(
      tap((res) => {
        this.currentUser.set(res.data.user);
        if (res.data.token) this.tokenService.save(res.data.token);
      }),
    );
  }

  logout(): Observable<ApiResponse<null>> {
    return this.api
      .post<null>(API_ROUTES.OTP.LOGOUT, {})
      .pipe(tap(() => this.clearSession()));
  }

  getToken(): string | null {
    return this.tokenService.get();
  }

  updateCurrentUserEmail(email: string): void {
    const user = this.currentUser();
    if (user) {
      this.currentUser.set({ ...user, email });
    }
  }

  clearSession(): void {
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('name');
    this.tokenService.clear();
    this.currentUser.set(null);
  }
}
