import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '@models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: Record<string, string> | null): Observable<ApiResponse<T>> {
    const httpParams = params ? new HttpParams({ fromObject: params }) : undefined;
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body?: unknown | null): Observable<ApiResponse<T>> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body ?? null)
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body?: unknown | null): Observable<ApiResponse<T>> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body ?? null)
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body?: unknown | null): Observable<ApiResponse<T>> {
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body ?? null)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, params?: Record<string, string> | null): Observable<ApiResponse<T>> {
    const httpParams = params ? new HttpParams({ fromObject: params }) : undefined;
    return this.http
      .delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  buildEndpoint(endpoint: string, id: number | string): string {
    return endpoint.replace(':id', String(id));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
