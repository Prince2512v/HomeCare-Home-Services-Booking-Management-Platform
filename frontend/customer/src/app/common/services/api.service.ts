import { Injectable, inject } from '@angular/core';
import {HttpClient,HttpErrorResponse,HttpParams,} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '@models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly adminBaseUrl = environment.adminApiUrl;

  get<T>(
    endpoint: string,
    params?: Record<string, string> | null,
    useAdmin = false,
  ): Observable<ApiResponse<T>> {
    const httpParams = params
      ? new HttpParams({ fromObject: params })
      : undefined;
    return this.http
      .get<
        ApiResponse<T>
      >(`${useAdmin ? this.adminBaseUrl : this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  post<T>(
    endpoint: string,
    body?: unknown | null,
    useAdmin = false,
  ): Observable<ApiResponse<T>> {
    return this.http
      .post<
        ApiResponse<T>
      >(`${useAdmin ? this.adminBaseUrl : this.baseUrl}${endpoint}`, body ?? null)
      .pipe(catchError(this.handleError));
  }

  put<T>(
    endpoint: string,
    body?: unknown | null,
    useAdmin = false,
  ): Observable<ApiResponse<T>> {
    return this.http
      .put<
        ApiResponse<T>
      >(`${useAdmin ? this.adminBaseUrl : this.baseUrl}${endpoint}`, body ?? null)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, useAdmin = false): Observable<ApiResponse<T>> {
    return this.http
      .delete<
        ApiResponse<T>
      >(`${useAdmin ? this.adminBaseUrl : this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  postFormData<T>(
    endpoint: string,
    formData: FormData,
    useAdmin = false,
  ): Observable<ApiResponse<T>> {
    return this.http
      .post<
        ApiResponse<T>
      >(`${useAdmin ? this.adminBaseUrl : this.baseUrl}${endpoint}`, formData)
      .pipe(catchError(this.handleError));
  }
  getBlob(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      responseType: 'blob',
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}