import ApiClient from './client';
import { ApiClientConfig } from './types';

// Import all services
import AuthService from './services/authService';
import UserService from './services/userService';
import ServiceService from './services/serviceService';
import NotificationService from './services/notificationService';
import AnalyticsService from './services/analyticsService';
import { VersioningService } from './services/versioningService';

class ApiManager {
  private apiClient: ApiClient;
  
  // Service instances
  public auth: AuthService;
  public users: UserService;
  public services: ServiceService;
  public notifications: NotificationService;
  public analytics: AnalyticsService;
  public versioning: VersioningService;

  constructor(config: Partial<ApiClientConfig> = {}) {
    // Initialize API client
    this.apiClient = new ApiClient(config);

    // Initialize all services
    this.auth = new AuthService(this.apiClient);
    this.users = new UserService(this.apiClient);
    this.services = new ServiceService(this.apiClient);
    this.notifications = new NotificationService(this.apiClient);
    this.analytics = new AnalyticsService(this.apiClient);
    this.versioning = new VersioningService();
  }

  // Get the underlying API client for custom usage
  getClient(): ApiClient {
    return this.apiClient;
  }

  // Update API configuration
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.apiClient.updateConfig(config);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    return this.apiClient.healthCheck();
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.apiClient.getAxiosInstance().defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Clear authentication token
  clearAuthToken(): void {
    delete this.apiClient.getAxiosInstance().defaults.headers.common['Authorization'];
  }

  // Enable/disable request/response logging
  setDebugMode(enabled: boolean): void {
    this.updateConfig({
      enableInterceptors: enabled
    });
  }

  // Versioning methods
  setApiVersion(version: string): void {
    this.apiClient.setApiVersion(version);
  }

  getApiVersion(): string {
    return this.apiClient.getApiVersion();
  }

  enableVersioning(enable: boolean = true): void {
    this.apiClient.enableVersioning(enable);
  }

  // Get current configuration
  getConfig(): Partial<ApiClientConfig> {
    // Note: In a real implementation, you'd expose the config from ApiClient
    return {
      baseURL: this.apiClient.getAxiosInstance().defaults.baseURL,
      timeout: this.apiClient.getAxiosInstance().defaults.timeout,
    };
  }
}

// Create singleton instance
const apiManager = new ApiManager({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  enableInterceptors: true,
  retryAttempts: 3,
  retryDelay: 1000,
});

export default apiManager;

// Also export the class for custom instances
export { ApiManager };
