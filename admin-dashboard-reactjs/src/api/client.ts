import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { store } from '../store';
import { refreshAccessToken, logoutUser } from '../store/slices/authSlice';
import config from '../config';
import { 
  ApiResponse, 
  PaginatedResponse, 
  RequestOptions, 
  ApiError, 
  HttpMethod,
  ApiClientConfig 
} from './types';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private config: ApiClientConfig;
  private refreshingTokens: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(apiConfig: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: config.api.baseURL,
      version: config.api.version,
      versioningEnabled: config.api.versioningEnabled,
      versionHeader: config.api.versionHeader,
      timeout: config.api.timeout,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(config.api.versioningEnabled && {
          [config.api.versionHeader]: config.api.version
        })
      },
      enableInterceptors: true,
      retryAttempts: config.api.retryAttempts,
      retryDelay: config.api.retryDelay,
      ...apiConfig,
    };

    this.axiosInstance = this.createAxiosInstance();
    
    if (this.config.enableInterceptors) {
      this.setupInterceptors();
    }
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.defaultHeaders,
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // Add auth token if required
        const state = store.getState();
        const token = state.auth.accessToken;
        
        if (token && config.headers && config.url && !config.url.includes('/auth/')) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.refreshingTokens) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.axiosInstance(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.refreshingTokens = true;

          try {
            await store.dispatch(refreshAccessToken()).unwrap();
            this.processQueue(null);
            
            // Retry original request
            const state = store.getState();
            const newToken = state.auth.accessToken;
            
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            store.dispatch(logoutUser());
            return Promise.reject(refreshError);
          } finally {
            this.refreshingTokens = false;
          }
        }

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ API Error:', {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  private handleError(error: AxiosError): ApiError {
    const errorData = error.response?.data as any;
    const message = errorData?.message || error.message || 'An unknown error occurred';
    const statusCode = error.response?.status || 500;
    
    return new ApiError(message, statusCode, errorData);
  }

  private async retry<T>(
    fn: () => Promise<T>,
    attempts: number = this.config.retryAttempts,
    delay: number = this.config.retryDelay
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempts <= 1) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retry(fn, attempts - 1, delay * 2);
    }
  }

  // Build versioned URL
  private buildVersionedUrl(url: string, version?: string): string {
    // Nếu là full URL thì trả về nguyên giá trị
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    if (!this.config.versioningEnabled) {
      return url;
    }
    const apiVersion = version || this.config.version;
    // If URL already starts with version, don't add it again
    if (url.startsWith(`/${apiVersion}/`) || url.startsWith(`${apiVersion}/`)) {
      return url;
    }
    // Add version prefix to URL
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${this.config.baseURL}/${apiVersion}${cleanUrl}`;
  }

  // Enhanced request method with versioning support
  async request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    options: RequestOptions & { version?: string } = {}
  ): Promise<ApiResponse<T>> {
    const { version, headers: optionHeaders, ...restOptions } = options;
    
    // Build versioned URL
    const versionedUrl = this.buildVersionedUrl(url, version);
    
    // Merge headers with version header if needed
    const headers = {
      ...optionHeaders,
      ...(this.config.versioningEnabled && version && {
        [this.config.versionHeader]: version
      })
    };

    const config: AxiosRequestConfig = {
      method,
      url: versionedUrl,
      data,
      headers,
      params: restOptions.params,
      timeout: restOptions.timeout || this.config.timeout,
    };

    const response = await this.axiosInstance.request<ApiResponse<T>>(config);
    return response.data;
  }

  // HTTP method shortcuts with versioning support
  async get<T = any>(url: string, options: RequestOptions & { version?: string } = {}): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T = any>(url: string, data?: any, options: RequestOptions & { version?: string } = {}): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, options);
  }

  async put<T = any>(url: string, data?: any, options: RequestOptions & { version?: string } = {}): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  async patch<T = any>(url: string, data?: any, options: RequestOptions & { version?: string } = {}): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, options);
  }

  async delete<T = any>(url: string, options: RequestOptions & { version?: string } = {}): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  // Paginated requests with versioning support
  async getPaginated<T = any>(
    url: string, 
    page: number = 1, 
    limit: number = 10,
    options: RequestOptions & { version?: string } = {}
  ): Promise<PaginatedResponse<T>> {
    const params = {
      page,
      limit,
      ...options.params,
    };

    const response = await this.get<PaginatedResponse<T>>(url, { ...options, params });
    return response.data;
  }

  // Upload file
  async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const config: RequestOptions = {
      ...options,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options.headers,
      },
    };

    return this.post<T>(url, formData, config);
  }

  // Download file
  async downloadFile(url: string, filename?: string, options: RequestOptions = {}): Promise<void> {
    const response = await this.axiosInstance.request({
      method: 'GET',
      url,
      responseType: 'blob',
      headers: options.headers,
      params: options.params,
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.baseURL) {
      this.axiosInstance.defaults.baseURL = newConfig.baseURL;
    }
    
    if (newConfig.timeout) {
      this.axiosInstance.defaults.timeout = newConfig.timeout;
    }
    
    if (newConfig.defaultHeaders) {
      Object.assign(this.axiosInstance.defaults.headers, newConfig.defaultHeaders);
    }
    
    // Update version header if versioning config changed
    if (newConfig.versioningEnabled !== undefined || newConfig.version || newConfig.versionHeader) {
      if (this.config.versioningEnabled && this.config.version) {
        (this.axiosInstance.defaults.headers as any)[this.config.versionHeader] = this.config.version;
      }
    }
  }

  // Versioning utility methods
  setApiVersion(version: string): void {
    this.config.version = version;
    if (this.config.versioningEnabled) {
      (this.axiosInstance.defaults.headers as any)[this.config.versionHeader] = version;
    }
  }

  getApiVersion(): string {
    return this.config.version;
  }

  enableVersioning(enable: boolean = true): void {
    this.config.versioningEnabled = enable;
    if (enable && this.config.version) {
      (this.axiosInstance.defaults.headers as any)[this.config.versionHeader] = this.config.version;
    } else if (!enable && this.config.versionHeader) {
      delete (this.axiosInstance.defaults.headers as any)[this.config.versionHeader];
    }
  }

  // Get axios instance for custom usage
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default ApiClient;
