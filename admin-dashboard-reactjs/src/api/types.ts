// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// Request Options
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  withAuth?: boolean;
}

// API Error Types
export class ApiError extends Error {
  public statusCode: number;
  public response?: any;
  
  constructor(message: string, statusCode: number, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Endpoints Configuration
export interface ApiEndpoint {
  method: HttpMethod;
  url: string;
  requiresAuth?: boolean;
  version?: string; // Optional version override
}

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  version: string;
  versioningEnabled: boolean;
  versionHeader: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
  enableInterceptors: boolean;
  retryAttempts: number;
  retryDelay: number;
}
