import ApiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types';

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class AuthService {
  constructor(private apiClient: ApiClient) {}

  // Login user
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN.url, credentials);
  }

  // Logout user
  async logout(): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT.url);
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH.url,
      { refreshToken }
    );
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<ApiResponse<LoginResponse['user']>> {
    return this.apiClient.get<LoginResponse['user']>(API_ENDPOINTS.AUTH.ME.url);
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/change-password', data);
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/reset-password', { token, password });
  }

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/verify-email', { token });
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/resend-verification');
  }
}

export default AuthService;
