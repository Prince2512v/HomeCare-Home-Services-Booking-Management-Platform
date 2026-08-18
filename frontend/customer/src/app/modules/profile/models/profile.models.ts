export interface UserProfile {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Address {
  addressId: string;
  userId: number;
  houseFlatNumber: string;
  landmark: string;
  fullAddress: string;
  saveAs: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface AddressListResponse {
  totalRecords: number;
  records: Address[];
}

export interface CreateAddressRequest {
  houseFlatNumber: string;
  landmark: string;
  fullAddress: string;
  saveAs: string;
  latitude: number;
  longitude: number;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}