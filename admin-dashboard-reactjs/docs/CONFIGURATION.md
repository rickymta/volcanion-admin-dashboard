# Configuration Management Guide

## Tổng quan

Hệ thống quản lý cấu hình tập trung cho ứng dụng Admin Dashboard, sử dụng environment variables để cấu hình các thành phần khác nhau của hệ thống.

## Cấu trúc Configuration

```typescript
interface AppConfig {
  api: ApiConfiguration;
  auth: AuthConfiguration;
  app: ApplicationInfo;
  features: FeatureFlags;
  ui: UIConfiguration;
  upload: UploadConfiguration;
}
```

## Environment Variables

### 📁 File `.env`

Tạo file `.env` trong thư mục root của project:

```bash
cp .env.example .env
```

### 🔧 API Configuration

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_TIMEOUT=10000
REACT_APP_API_RETRY_ATTEMPTS=3
REACT_APP_API_RETRY_DELAY=1000
```

### 🔐 Authentication Configuration

```env
REACT_APP_TOKEN_STORAGE_KEY=volcanion_access_token
REACT_APP_REFRESH_TOKEN_STORAGE_KEY=volcanion_refresh_token
REACT_APP_USER_STORAGE_KEY=volcanion_user_data
REACT_APP_TOKEN_EXPIRY_BUFFER=300000
REACT_APP_SESSION_TIMEOUT=3600000
REACT_APP_IDLE_TIMEOUT=1800000
REACT_APP_MAX_LOGIN_ATTEMPTS=5
```

### ℹ️ Application Information

```env
REACT_APP_APP_NAME=Volcanion Admin Dashboard
REACT_APP_APP_VERSION=1.0.0
REACT_APP_COMPANY_NAME=Volcanion Technologies
REACT_APP_SUPPORT_EMAIL=support@volcanion.com
```

### 🚀 Feature Flags

```env
REACT_APP_ENABLE_DEBUG_MODE=true
REACT_APP_ENABLE_API_LOGGING=true
REACT_APP_ENABLE_ERROR_REPORTING=true
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_PUSH_NOTIFICATIONS=false
REACT_APP_ENABLE_SERVICE_WORKER=false
```

### 🎨 UI Configuration

```env
REACT_APP_DEFAULT_PAGE_SIZE=10
REACT_APP_MAX_PAGE_SIZE=100
REACT_APP_DEFAULT_THEME=light
REACT_APP_PRIMARY_COLOR=#1976d2
REACT_APP_SECONDARY_COLOR=#dc004e
REACT_APP_NOTIFICATION_TIMEOUT=5000
REACT_APP_MAX_NOTIFICATIONS=5
```

### 📁 Upload Configuration

```env
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx
REACT_APP_UPLOAD_ENDPOINT=/upload
```

### 🛠️ Development Configuration

```env
REACT_APP_MOCK_API=true
REACT_APP_API_DELAY=1000
```

## Sử dụng Configuration

### 1. Import Configuration

```typescript
import config from '../config';
```

### 2. Sử dụng trong Components

```typescript
const MyComponent = () => {
  // API configuration
  const apiUrl = config.api.baseURL;
  
  // UI configuration
  const pageSize = config.ui.defaultPageSize;
  
  // Feature flags
  const debugMode = config.features.debugMode;
  
  return <div>...</div>;
};
```

### 3. Validation

```typescript
import { validateConfig } from '../config';

const validation = validateConfig();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Environment-specific Configurations

### Development (.env.development)

```env
REACT_APP_ENABLE_DEBUG_MODE=true
REACT_APP_ENABLE_API_LOGGING=true
REACT_APP_MOCK_API=true
```

### Production (.env.production)

```env
REACT_APP_ENABLE_DEBUG_MODE=false
REACT_APP_ENABLE_API_LOGGING=false
REACT_APP_MOCK_API=false
REACT_APP_ENABLE_SERVICE_WORKER=true
```

### Testing (.env.test)

```env
REACT_APP_API_URL=http://localhost:3001/test-api
REACT_APP_MOCK_API=true
REACT_APP_API_DELAY=0
```

## Configuration Hierarchy

1. **Default values** (trong `config/index.ts`)
2. **Environment variables** (`.env` files)
3. **Runtime configuration** (nếu có)

## Best Practices

### 1. Naming Convention

- Prefix: `REACT_APP_`
- Format: `REACT_APP_SECTION_PROPERTY`
- Examples:
  - `REACT_APP_API_URL`
  - `REACT_APP_AUTH_TOKEN_KEY`
  - `REACT_APP_UI_THEME_COLOR`

### 2. Type Safety

```typescript
// ✅ Good - Use typed config
const timeout = config.api.timeout;

// ❌ Bad - Direct environment access
const timeout = process.env.REACT_APP_API_TIMEOUT;
```

### 3. Validation

```typescript
// Validate configuration on app startup
const validation = validateConfig();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
  // Handle configuration errors
}
```

### 4. Documentation

- Document mỗi environment variable
- Provide examples và default values
- Explain impact của từng configuration

## Security Considerations

### 1. Sensitive Data

⚠️ **QUAN TRỌNG**: Không lưu sensitive data trong environment variables của React app:

```env
# ❌ KHÔNG ĐƯỢC - These will be exposed in browser
REACT_APP_API_SECRET=secret123
REACT_APP_DATABASE_PASSWORD=password123

# ✅ OK - These are safe for client-side
REACT_APP_API_URL=https://api.example.com
REACT_APP_APP_NAME=My App
```

### 2. Environment-specific Secrets

```env
# Development
REACT_APP_API_URL=http://localhost:3001/api

# Production  
REACT_APP_API_URL=https://api.production.com/api
```

## Debugging Configuration

### 1. Debug Mode

```typescript
// Enable trong development
if (config.features.debugMode) {
  console.log('Current config:', config);
}
```

### 2. Configuration Inspector

Truy cập `/settings` để xem current configuration trong UI.

### 3. Runtime Configuration Check

```typescript
// Check configuration validity
import { logConfig } from '../config';

// Log configuration trong development
logConfig();
```

## Troubleshooting

### 1. Configuration Not Loading

```bash
# Check if .env file exists
ls -la .env

# Check environment variables
echo $REACT_APP_API_URL
```

### 2. Invalid Configuration

```typescript
// Check validation errors
const validation = validateConfig();
console.log('Validation:', validation);
```

### 3. Environment Variables Not Working

- Ensure variables start with `REACT_APP_`
- Restart development server after changing `.env`
- Check for typos trong variable names

## Migration Guide

### From Hardcoded Values

```typescript
// Before
const API_URL = 'http://localhost:3001/api';

// After
import config from '../config';
const API_URL = config.api.baseURL;
```

### From Direct process.env Access

```typescript
// Before
const timeout = parseInt(process.env.REACT_APP_API_TIMEOUT || '10000');

// After
import config from '../config';
const timeout = config.api.timeout;
```

## Testing Configuration

### Unit Tests

```typescript
import { validateConfig } from '../config';

describe('Configuration', () => {
  it('should have valid configuration', () => {
    const validation = validateConfig();
    expect(validation.isValid).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Test with different environment configurations
process.env.REACT_APP_API_URL = 'http://test-api.com';
import config from '../config';

expect(config.api.baseURL).toBe('http://test-api.com');
```
