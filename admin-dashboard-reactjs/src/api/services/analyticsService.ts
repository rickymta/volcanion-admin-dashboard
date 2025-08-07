import ApiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types';

// Analytics related types
export interface DashboardMetrics {
  totalUsers: number;
  activeServices: number;
  totalRequests: number;
  systemHealth: number;
  responseTime: number;
  uptime: number;
}

export interface MetricData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  data: MetricData[];
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface MetricsParams {
  metric: 'cpu' | 'memory' | 'requests' | 'response_time' | 'errors';
  period: 'hour' | 'day' | 'week' | 'month';
  startDate?: string;
  endDate?: string;
}

export interface ExportRequest {
  reportType: 'users' | 'services' | 'analytics' | 'logs';
  format: 'csv' | 'xlsx' | 'pdf';
  period: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}

class AnalyticsService {
  constructor(private apiClient: ApiClient) {}

  // Get dashboard metrics
  async getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return this.apiClient.get<DashboardMetrics>(API_ENDPOINTS.ANALYTICS.DASHBOARD.url);
  }

  // Get metrics data
  async getMetrics(params: MetricsParams): Promise<ApiResponse<MetricData[]>> {
    return this.apiClient.get<MetricData[]>(API_ENDPOINTS.ANALYTICS.METRICS.url, { params });
  }

  // Get reports list
  async getReports(
    params: {
      page?: number;
      limit?: number;
      type?: AnalyticsReport['type'];
      sortBy?: 'name' | 'generatedAt';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<ApiResponse<AnalyticsReport[]>> {
    return this.apiClient.get<AnalyticsReport[]>(API_ENDPOINTS.ANALYTICS.REPORTS.url, { params });
  }

  // Generate custom report
  async generateReport(
    type: AnalyticsReport['type'],
    period: { startDate: string; endDate: string },
    metrics: string[] = []
  ): Promise<ApiResponse<AnalyticsReport>> {
    return this.apiClient.post<AnalyticsReport>('/analytics/generate-report', {
      type,
      period,
      metrics
    });
  }

  // Export data
  async exportData(request: ExportRequest): Promise<void> {
    await this.apiClient.downloadFile(API_ENDPOINTS.ANALYTICS.EXPORT.url, undefined, {
      params: request
    });
  }

  // Get system performance
  async getSystemPerformance(period: '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse<{
    cpu: MetricData[];
    memory: MetricData[];
    disk: MetricData[];
    network: MetricData[];
  }>> {
    return this.apiClient.get('/analytics/system-performance', {
      params: { period }
    });
  }

  // Get service performance
  async getServicePerformance(
    serviceId: string,
    period: '24h' | '7d' | '30d' = '24h'
  ): Promise<ApiResponse<{
    responseTime: MetricData[];
    requests: MetricData[];
    errors: MetricData[];
    uptime: number;
  }>> {
    return this.apiClient.get(`/analytics/service-performance/${serviceId}`, {
      params: { period }
    });
  }

  // Get user activity
  async getUserActivity(period: '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse<{
    logins: MetricData[];
    activeUsers: MetricData[];
    newUsers: MetricData[];
  }>> {
    return this.apiClient.get('/analytics/user-activity', {
      params: { period }
    });
  }
}

export default AnalyticsService;
