import { ApiEndpoint } from './types';

// API Endpoints Configuration with versioning support
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: { method: 'POST' as const, url: '/auth/login', requiresAuth: false },
    LOGOUT: { method: 'POST' as const, url: '/auth/logout', requiresAuth: true },
    REFRESH: { method: 'POST' as const, url: '/auth/refresh-token', requiresAuth: false },
    ME: { method: 'GET' as const, url: '/auth/me', requiresAuth: true },
  },

  // Users
  USERS: {
    LIST: { method: 'GET' as const, url: '/users', requiresAuth: true },
    GET: { method: 'GET' as const, url: '/users/:id', requiresAuth: true },
    CREATE: { method: 'POST' as const, url: '/users', requiresAuth: true },
    UPDATE: { method: 'PUT' as const, url: '/users/:id', requiresAuth: true },
    DELETE: { method: 'DELETE' as const, url: '/users/:id', requiresAuth: true },
    PROFILE: { method: 'GET' as const, url: '/users/profile', requiresAuth: true },
    UPDATE_PROFILE: { method: 'PUT' as const, url: '/users/profile', requiresAuth: true },
    UPLOAD_AVATAR: { method: 'POST' as const, url: '/users/avatar', requiresAuth: true },
  },

  // Services
  SERVICES: {
    LIST: { method: 'GET' as const, url: '/services', requiresAuth: true },
    GET: { method: 'GET' as const, url: '/services/:id', requiresAuth: true },
    CREATE: { method: 'POST' as const, url: '/services', requiresAuth: true },
    UPDATE: { method: 'PUT' as const, url: '/services/:id', requiresAuth: true },
    DELETE: { method: 'DELETE' as const, url: '/services/:id', requiresAuth: true },
    START: { method: 'POST' as const, url: '/services/:id/start', requiresAuth: true },
    STOP: { method: 'POST' as const, url: '/services/:id/stop', requiresAuth: true },
    RESTART: { method: 'POST' as const, url: '/services/:id/restart', requiresAuth: true },
    LOGS: { method: 'GET' as const, url: '/services/:id/logs', requiresAuth: true },
    STATUS: { method: 'GET' as const, url: '/services/:id/status', requiresAuth: true },
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: { method: 'GET' as const, url: '/analytics/dashboard', requiresAuth: true },
    METRICS: { method: 'GET' as const, url: '/analytics/metrics', requiresAuth: true },
    REPORTS: { method: 'GET' as const, url: '/analytics/reports', requiresAuth: true },
    EXPORT: { method: 'POST' as const, url: '/analytics/export', requiresAuth: true },
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: { method: 'GET' as const, url: '/notifications', requiresAuth: true },
    GET: { method: 'GET' as const, url: '/notifications/:id', requiresAuth: true },
    MARK_READ: { method: 'PUT' as const, url: '/notifications/:id/read', requiresAuth: true },
    MARK_ALL_READ: { method: 'PUT' as const, url: '/notifications/read-all', requiresAuth: true },
    DELETE: { method: 'DELETE' as const, url: '/notifications/:id', requiresAuth: true },
    CLEAR_ALL: { method: 'DELETE' as const, url: '/notifications', requiresAuth: true },
  },

  // Settings
  SETTINGS: {
    GET: { method: 'GET' as const, url: '/settings', requiresAuth: true },
    UPDATE: { method: 'PUT' as const, url: '/settings', requiresAuth: true },
    RESET: { method: 'POST' as const, url: '/settings/reset', requiresAuth: true },
  },

  // File Management
  FILES: {
    UPLOAD: { method: 'POST' as const, url: '/files/upload', requiresAuth: true },
    DOWNLOAD: { method: 'GET' as const, url: '/files/:id/download', requiresAuth: true },
    DELETE: { method: 'DELETE' as const, url: '/files/:id', requiresAuth: true },
    LIST: { method: 'GET' as const, url: '/files', requiresAuth: true },
  },

  // System
  SYSTEM: {
    HEALTH: { method: 'GET' as const, url: '/health', requiresAuth: false },
    VERSION: { method: 'GET' as const, url: '/version', requiresAuth: false },
    STATUS: { method: 'GET' as const, url: '/system/status', requiresAuth: true },
    INFO: { method: 'GET' as const, url: '/system/info', requiresAuth: true },
  },
} as const;

// Helper function to build URL with parameters
export const buildUrl = (template: string, params: Record<string, string | number> = {}): string => {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`:${key}`, String(value)),
    template
  );
};

// Helper function to build versioned URL
export const buildVersionedUrl = (
  baseUrl: string,
  endpoint: string, 
  version: string = 'v1',
  params: Record<string, string | number> = {}
): string => {
  const versionedUrl = `${baseUrl}/${version}${endpoint}`;
  return buildUrl(versionedUrl, params);
};

// Helper function to get endpoint configuration
export const getEndpoint = (path: string): ApiEndpoint | undefined => {
  const pathParts = path.split('.');
  let current: any = API_ENDPOINTS;
  
  for (const part of pathParts) {
    current = current[part];
    if (!current) return undefined;
  }
  
  return current;
};

// Helper function to get endpoint with version support
export const getVersionedEndpoint = (
  path: string,
  version?: string
): (ApiEndpoint & { version?: string }) | undefined => {
  const endpoint = getEndpoint(path);
  if (!endpoint) return undefined;
  
  return {
    ...endpoint,
    ...(version && { version })
  };
};
