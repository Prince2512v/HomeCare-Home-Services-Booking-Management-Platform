export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  isSuperAdmin: boolean;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}
export interface ForgotPasswordResponse {
  message: string;
}
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
export interface ResetPasswordResponse {
  message: string;
}