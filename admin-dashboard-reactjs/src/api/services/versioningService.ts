import apiManager from '../index';
import { ApiResponse } from '../types';
import { API_ENDPOINTS, buildUrl } from '../endpoints';

// Example service demonstrating API versioning usage
export class VersioningService {
  // Default version calls (uses configured version)
  async getUsers() {
    return apiManager.getClient().get<any[]>(API_ENDPOINTS.USERS.LIST.url);
  }

  // Specific version calls
  async getUsersV1() {
    return apiManager.getClient().get<any[]>(API_ENDPOINTS.USERS.LIST.url, {
      version: 'v1'
    });
  }

  async getUsersV2() {
    return apiManager.getClient().get<any[]>(API_ENDPOINTS.USERS.LIST.url, {
      version: 'v2'
    });
  }

  // Dynamic version based on parameter
  async getUsersByVersion(version: string = 'v1') {
    return apiManager.getClient().get<any[]>(API_ENDPOINTS.USERS.LIST.url, {
      version
    });
  }

  // Mixed version example - some endpoints use different versions
  async getDashboardData(userVersion: string = 'v1', analyticsVersion: string = 'v2') {
    const [users, analytics] = await Promise.all([
      apiManager.getClient().get<any[]>(API_ENDPOINTS.USERS.LIST.url, { version: userVersion }),
      apiManager.getClient().get<any>(API_ENDPOINTS.ANALYTICS.DASHBOARD.url, { version: analyticsVersion })
    ]);

    return {
      users: users.data,
      analytics: analytics.data
    };
  }

  // Version-specific endpoints with different data structure
  async getProfileData(userId: string, version: string = 'v1') {
    const url = buildUrl(API_ENDPOINTS.USERS.GET.url, { id: userId });
    
    switch (version) {
      case 'v1':
        // v1 returns basic user info
        return apiManager.getClient().get<{
          id: string;
          name: string;
          email: string;
        }>(url, { version: 'v1' });
        
      case 'v2':
        // v2 returns extended user info with preferences
        return apiManager.getClient().get<{
          id: string;
          name: string;
          email: string;
          profile: {
            avatar: string;
            bio: string;
            preferences: Record<string, any>;
          };
        }>(url, { version: 'v2' });
        
      default:
        return apiManager.getClient().get<any>(url, { version });
    }
  }

  // Legacy endpoint support
  async getLegacyData() {
    // Some old endpoints might not support versioning
    return apiManager.getClient().get<any>('/legacy/data', {
      version: undefined // Explicitly disable versioning for this call
    });
  }

  // Batch operations with versioning
  async batchCreateUsers(users: any[], version: string = 'v1') {
    return apiManager.getClient().post<{
      created: number;
      errors: any[];
    }>(API_ENDPOINTS.USERS.CREATE.url, {
      users,
      batch: true
    }, { version });
  }
}

export const versioningService = new VersioningService();
