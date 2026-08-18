export interface AdminProfileModel {
    name: string;
    role: string;
    email: string;
    mobileNumber: string;
    address: string;
    imageUrl: string | null;
}

export interface UpdateContactModel {
    email: string;
    mobileNumber: string;
    address: string;
}

export interface UpdatePasswordModel {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateContactResponse {
    message: string;
}

export interface UpdatePasswordResponse {
    message: string;
}

export interface UpdateProfileImageResponse {
    message: string;
}