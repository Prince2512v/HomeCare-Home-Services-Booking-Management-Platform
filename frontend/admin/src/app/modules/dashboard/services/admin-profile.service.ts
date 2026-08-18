import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import {
  UpdateContactModel,
  UpdatePasswordModel,
  AdminProfileModel,
  UpdateContactResponse,
  UpdatePasswordResponse,
  UpdateProfileImageResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AdminProfileService {
  private profileSubject = new BehaviorSubject<AdminProfileModel | null>(null);
  profile$ = this.profileSubject.asObservable();

  private apiService = inject(ApiService);

  getProfile(): Observable<ApiResponse<AdminProfileModel>> {
    return this.apiService.get<AdminProfileModel>(API_ROUTES.ADMIN.PROFILE.BASE).pipe(
      map((res) => {
        const profile = res.data;
        if (profile.imageUrl) {
          profile.imageUrl = `${this.apiService.baseUrl}${profile.imageUrl}`;
        }
        this.profileSubject.next(profile);
        return res;
      })
    );
  }

  updateContact(data: UpdateContactModel): Observable<ApiResponse<UpdateContactResponse>> {
    return this.apiService
      .patch<UpdateContactResponse>(API_ROUTES.ADMIN.PROFILE.CONTACT, data)
      .pipe(
        map((res) => {
          const current = this.profileSubject.value;
          if (current && res.isSuccess) {
            this.profileSubject.next({ ...current, ...data });
          }
          return res;
        })
      );
  }

  updatePassword(data: UpdatePasswordModel): Observable<ApiResponse<UpdatePasswordResponse>> {
    return this.apiService.patch<UpdatePasswordResponse>(API_ROUTES.ADMIN.PROFILE.PASSWORD, data);
  }

  updateProfileImage(file: File): Observable<ApiResponse<UpdateProfileImageResponse>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.apiService.patch<UpdateProfileImageResponse>(
      API_ROUTES.ADMIN.PROFILE.IMAGE,
      formData
    );
  }

  pushImagePreview(imageUrl: string): void {
    const current = this.profileSubject.value;
    if (current) {
      this.profileSubject.next({ ...current, imageUrl });
    }
  }

  clearProfile(): void {
    this.profileSubject.next(null);
  }

  get profileData(): AdminProfileModel | null {
    return this.profileSubject.value;
  }
}
