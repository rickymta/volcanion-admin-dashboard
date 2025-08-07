import ApiClient from '../client';
import { API_ENDPOINTS, buildUrl } from '../endpoints';
import { ApiResponse, PaginatedResponse } from '../types';

// Service related types
export interface Service {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  version: string;
  port: number;
  healthCheckUrl?: string;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  createdAt: string;
  updatedAt: string;
  lastStarted?: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  version: string;
  port: number;
  healthCheckUrl?: string;
  environment?: Record<string, string>;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  version?: string;
  port?: number;
  healthCheckUrl?: string;
  environment?: Record<string, string>;
}

export interface ServiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Service['status'];
  sortBy?: 'name' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceLog {
  id: string;
  serviceId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ServiceStatus {
  status: Service['status'];
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  lastHealthCheck: string;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
}

class ServiceService {
  constructor(private apiClient: ApiClient) {}

  // Get paginated services list
  async getServices(params: ServiceListParams = {}): Promise<PaginatedResponse<Service>> {
    return this.apiClient.getPaginated<Service>(
      API_ENDPOINTS.SERVICES.LIST.url,
      params.page,
      params.limit,
      { params }
    );
  }

  // Get service by ID
  async getService(id: string): Promise<ApiResponse<Service>> {
    const url = buildUrl(API_ENDPOINTS.SERVICES.GET.url, { id });
    return this.apiClient.get<Service>(url);
  }

  // Create new service
  async createService(serviceData: CreateServiceRequest): Promise<ApiResponse<Service>> {
    return this.apiClient.post<Service>(API_ENDPOINTS.SERVICES.CREATE.url, serviceData);
  }

  // Update service
  async updateService(id: string, serviceData: UpdateServiceRequest): Promise<ApiResponse<Service>> {
    const url = buildUrl(API_ENDPOINTS.SERVICES.UPDATE.url, { id });
    return this.apiClient.put<Service>(url, serviceData);
  }

  // Delete service
  async deleteService(id: string): Promise<ApiResponse<void>> {
    const url = buildUrl(API_ENDPOINTS.SERVICES.DELETE.url, { id });
    return this.apiClient.delete(url);
  }

  // Start service
  async startService(id: string): Promise<ApiResponse<Service>> {
    const url = buildUrl(API_ENDPOINTS.SERVICES.START.url, { id });
    return this.apiClient.post<Service>(url);
  }

  // Stop service
  async stopService(id: string): Promise<ApiResponse<Service>> {
    const url = buildUrl(API_ENDPOINTS.SERVICES.STOP.url, { id });
    return this.apiClient.post<Service>(url);
  }

  // Restart service
  async restartService(id: string): Promise<ApiResponse<Service>> {
    const url = buildUrl(API_ENDPOINTS.SERVICES.RESTART.url, { id });
    return this.apiClient.post<Service>(url);
  }

  // Get service logs
  async getServiceLogs(
    id: string,
    params: {
      page?: number;
      limit?: number;
      level?: ServiceLog['level'];
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<PaginatedResponse<ServiceLog>> {
    const url = buildUrl(API_ENDPOINTS.SERVICES.LOGS.url, { id });
    return this.apiClient.getPaginated<ServiceLog>(url, params.page, params.limit, { params });
  }

  // Get service status
  async getServiceStatus(id: string): Promise<ApiResponse<ServiceStatus>> {
    const url = buildUrl(API_ENDPOINTS.SERVICES.STATUS.url, { id });
    return this.apiClient.get<ServiceStatus>(url);
  }

  // Get all services status
  async getAllServicesStatus(): Promise<ApiResponse<ServiceStatus[]>> {
    return this.apiClient.get<ServiceStatus[]>('/services/status-all');
  }

  // Search services
  async searchServices(query: string): Promise<ApiResponse<Service[]>> {
    return this.apiClient.get<Service[]>(API_ENDPOINTS.SERVICES.LIST.url, {
      params: { search: query, limit: 10 }
    });
  }
}

export default ServiceService;
