import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ROUTES } from '@constants';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import type {UserProfile,Address,AddressListResponse,CreateAddressRequest,NominatimResult} from '@profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = inject(ApiService);

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.api.get<UserProfile>(API_ROUTES.USERS.PROFILE);
  }

  updatePhone(mobileNumber: string): Observable<ApiResponse<UserProfile>> {
    return this.api.put<UserProfile>(API_ROUTES.USERS.PROFILE_PHONE, { mobileNumber });
  }

  sendEmailOtp(newEmail: string): Observable<ApiResponse<null>> {
    return this.api.post<null>(API_ROUTES.USERS.PROFILE_EMAIL_SEND_OTP, { newEmail });
  }

  updateEmail(newEmail: string, otp: string): Observable<ApiResponse<UserProfile>> {
    return this.api.put<UserProfile>(API_ROUTES.USERS.PROFILE_EMAIL, { newEmail, otp });
  }

  getAddresses(): Observable<ApiResponse<AddressListResponse>> {
    return this.api.get<AddressListResponse>(API_ROUTES.ADDRESS.BASE);
  }

  createAddress(addressRequest: CreateAddressRequest): Observable<ApiResponse<Address>> {
    return this.api.post<Address>(API_ROUTES.ADDRESS.BASE, addressRequest);
  }

  updateAddress(
    addressId: string,
    addressRequest: CreateAddressRequest,
  ): Observable<ApiResponse<Address>> {
    return this.api.put<Address>(`${API_ROUTES.ADDRESS.BASE}/${addressId}`, addressRequest);
  }

  deleteAddress(addressId: string): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`${API_ROUTES.ADDRESS.BASE}/${addressId}`);
  }

  reverseGeocode(
    latitude: number,
    longitude: number,
  ): Observable<ApiResponse<{ displayTitle: string; displaySubtitle: string }>> {
    return this.api.post<{ displayTitle: string; displaySubtitle: string }>(
      API_ROUTES.ADDRESS.REVERSE_GEOCODE,
      { latitude, longitude },
    );
  }

  searchAddress(searchQuery: string): Observable<ApiResponse<NominatimResult[]>> {
    return this.api.get<NominatimResult[]>(API_ROUTES.ADDRESS.SEARCH, { searchQuery });
  }
}