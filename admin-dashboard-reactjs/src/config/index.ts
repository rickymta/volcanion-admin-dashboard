/**
 * Application Configuration
 * Centralized configuration management using environment variables
 */

export interface AppConfig {
  api: {
    baseURL: string;
    version: string;
    versioningEnabled: boolean;
    versionHeader: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    mockAPI: boolean;
    apiDelay: number;
  };
  auth: {
    tokenStorageKey: string;
    refreshTokenStorageKey: string;
    userStorageKey: string;
    tokenExpiryBuffer: number;
    sessionTimeout: number;
    idleTimeout: number;
    maxLoginAttempts: number;
  };
  app: {
    name: string;
    version: string;
    companyName: string;
    supportEmail: string;
  };
  features: {
    debugMode: boolean;
    apiLogging: boolean;
    errorReporting: boolean;
    analytics: boolean;
    pushNotifications: boolean;
    serviceWorker: boolean;
  };
  ui: {
    defaultPageSize: number;
    maxPageSize: number;
    defaultTheme: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
    notificationTimeout: number;
    maxNotifications: number;
  };
  upload: {
    maxFileSize: number;
    allowedFileTypes: string[];
    uploadEndpoint: string;
  };
}

// Helper function to parse boolean environment variables
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Helper function to parse number environment variables
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to parse array environment variables
const parseArray = (value: string | undefined, defaultValue: string[] = []): string[] => {
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim());
};

// Load configuration from environment variables
export const config: AppConfig = {
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    version: process.env.REACT_APP_API_VERSION || 'v1',
    versioningEnabled: parseBoolean(process.env.REACT_APP_API_VERSIONING_ENABLED, true),
    versionHeader: process.env.REACT_APP_API_VERSION_HEADER || 'X-API-Version',
    timeout: parseNumber(process.env.REACT_APP_API_TIMEOUT, 10000),
    retryAttempts: parseNumber(process.env.REACT_APP_API_RETRY_ATTEMPTS, 3),
    retryDelay: parseNumber(process.env.REACT_APP_API_RETRY_DELAY, 1000),
    mockAPI: parseBoolean(process.env.REACT_APP_MOCK_API, true),
    apiDelay: parseNumber(process.env.REACT_APP_API_DELAY, 1000),
  },
  auth: {
    tokenStorageKey: process.env.REACT_APP_TOKEN_STORAGE_KEY || 'access_token',
    refreshTokenStorageKey: process.env.REACT_APP_REFRESH_TOKEN_STORAGE_KEY || 'refresh_token',
    userStorageKey: process.env.REACT_APP_USER_STORAGE_KEY || 'user_data',
    tokenExpiryBuffer: parseNumber(process.env.REACT_APP_TOKEN_EXPIRY_BUFFER, 300000), // 5 minutes
    sessionTimeout: parseNumber(process.env.REACT_APP_SESSION_TIMEOUT, 3600000), // 1 hour
    idleTimeout: parseNumber(process.env.REACT_APP_IDLE_TIMEOUT, 1800000), // 30 minutes
    maxLoginAttempts: parseNumber(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS, 5),
  },
  app: {
    name: process.env.REACT_APP_APP_NAME || 'Admin Dashboard',
    version: process.env.REACT_APP_APP_VERSION || '1.0.0',
    companyName: process.env.REACT_APP_COMPANY_NAME || 'Your Company',
    supportEmail: process.env.REACT_APP_SUPPORT_EMAIL || 'support@company.com',
  },
  features: {
    debugMode: parseBoolean(process.env.REACT_APP_ENABLE_DEBUG_MODE, false),
    apiLogging: parseBoolean(process.env.REACT_APP_ENABLE_API_LOGGING, false),
    errorReporting: parseBoolean(process.env.REACT_APP_ENABLE_ERROR_REPORTING, true),
    analytics: parseBoolean(process.env.REACT_APP_ENABLE_ANALYTICS, false),
    pushNotifications: parseBoolean(process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS, false),
    serviceWorker: parseBoolean(process.env.REACT_APP_ENABLE_SERVICE_WORKER, false),
  },
  ui: {
    defaultPageSize: parseNumber(process.env.REACT_APP_DEFAULT_PAGE_SIZE, 10),
    maxPageSize: parseNumber(process.env.REACT_APP_MAX_PAGE_SIZE, 100),
    defaultTheme: (process.env.REACT_APP_DEFAULT_THEME as 'light' | 'dark') || 'light',
    primaryColor: process.env.REACT_APP_PRIMARY_COLOR || '#1976d2',
    secondaryColor: process.env.REACT_APP_SECONDARY_COLOR || '#dc004e',
    notificationTimeout: parseNumber(process.env.REACT_APP_NOTIFICATION_TIMEOUT, 5000),
    maxNotifications: parseNumber(process.env.REACT_APP_MAX_NOTIFICATIONS, 5),
  },
  upload: {
    maxFileSize: parseNumber(process.env.REACT_APP_MAX_FILE_SIZE, 10485760), // 10MB
    allowedFileTypes: parseArray(
      process.env.REACT_APP_ALLOWED_FILE_TYPES,
      ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx']
    ),
    uploadEndpoint: process.env.REACT_APP_UPLOAD_ENDPOINT || '/upload',
  },
};

// Configuration validation
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate API configuration
  if (!config.api.baseURL) {
    errors.push('API base URL is required');
  }

  if (config.api.timeout <= 0) {
    errors.push('API timeout must be greater than 0');
  }

  // Validate auth configuration
  if (!config.auth.tokenStorageKey) {
    errors.push('Token storage key is required');
  }

  // Validate app configuration
  if (!config.app.name) {
    errors.push('App name is required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (config.app.supportEmail && !emailRegex.test(config.app.supportEmail)) {
    errors.push('Invalid support email format');
  }

  // Validate UI configuration
  if (config.ui.defaultPageSize <= 0) {
    errors.push('Default page size must be greater than 0');
  }

  if (config.ui.maxPageSize < config.ui.defaultPageSize) {
    errors.push('Max page size must be greater than or equal to default page size');
  }

  // Validate upload configuration
  if (config.upload.maxFileSize <= 0) {
    errors.push('Max file size must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Debug helper - only available in development
export const logConfig = (): void => {
  if (process.env.NODE_ENV === 'development' && config.features.debugMode) {
    console.group('🔧 Application Configuration');
    console.log('API Config:', config.api);
    console.log('Auth Config:', config.auth);
    console.log('App Config:', config.app);
    console.log('Features:', config.features);
    console.log('UI Config:', config.ui);
    console.log('Upload Config:', config.upload);
    console.groupEnd();

    const validation = validateConfig();
    if (!validation.isValid) {
      console.group('❌ Configuration Errors');
      validation.errors.forEach(error => console.error(error));
      console.groupEnd();
    } else {
      console.log('✅ Configuration is valid');
    }
  }
};

export default config;
