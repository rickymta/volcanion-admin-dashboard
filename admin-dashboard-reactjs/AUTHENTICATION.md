# Volcanion Admin Dashboard - Authentication Guide

## Chức Năng Đăng Nhập và Xác Thực

### 🔧 Cấu Hình API

Ứng dụng hỗ trợ hai chế độ API:

1. **Mock API** (development): Sử dụng dữ liệu giả lập
2. **Real API** (production): Kết nối với backend thật

#### Cấu hình trong .env:
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://localhost:7258/api
REACT_APP_API_VERSION=v1
REACT_APP_API_VERSIONING_ENABLED=true
REACT_APP_API_MOCK=false  # true cho Mock API, false cho Real API
```

### 🚀 API Endpoints

#### Authentication Endpoints:
- **Login**: `POST /api/v1/auth/login`
- **Refresh Token**: `POST /api/v1/auth/refresh-token`
- **Get Current User**: `GET /api/v1/auth/me`
- **Logout**: `POST /api/v1/auth/logout`

### 🔑 Mock API - Tài Khoản Test

Khi sử dụng Mock API (`REACT_APP_API_MOCK=true`):

#### Tài khoản Admin:
- **Email**: `john.doe@volcanion.com`
- **Password**: `password123`

#### Tài khoản User:
- **Email**: `jane.smith@volcanion.com`
- **Password**: `password123`

### 🔒 Real API - Cấu Hình Backend

Khi sử dụng Real API (`REACT_APP_API_MOCK=false`):

1. **Backend URL**: `https://localhost:7258`
2. **API Base**: `/api/v1`
3. **SSL Certificate**: Đảm bảo backend có SSL hợp lệ hoặc trust self-signed certificate

#### Cấu trúc Request/Response:

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "your-password",
  "rememberMe": false
}
```

**Login Response:**
```json
{
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "position": "string",
    "department": "string",
    "avatar": "string"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 3600
}
```

**Refresh Token Request:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Refresh Token Response:**
```json
{
  "accessToken": "new-jwt-token",
  "expiresIn": 3600
}
```

### 🔄 Token Management

#### Automatic Token Refresh:
- Token được tự động refresh trước khi hết hạn 5 phút
- Sử dụng JWT parsing để xác định thời gian hết hạn
- Fallback cho Mock tokens (refresh mỗi 14 phút)

#### Token Storage:
- **Access Token**: Redux store + localStorage
- **Refresh Token**: localStorage only
- **User Info**: Redux store + localStorage

### 🧪 Testing Tools

#### API Connection Tester:
Truy cập `/api-connection-tester` để:
- Kiểm tra kết nối API
- Test authentication endpoints  
- Validate token functionality
- Monitor API health

#### API Versioning Demo:
Truy cập `/api-versioning-demo` để:
- Test API versioning features
- Switch between API versions
- Monitor API responses

### 🛠️ Development Setup

1. **Clone và Install:**
```bash
git clone <repository>
cd admin-dashboard-reactjs
npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Development:**
```bash
npm start
```

### 🔧 Configuration Options

#### API Client Config:
```typescript
{
  baseURL: string;           // API base URL
  version: string;           // API version (v1, v2, etc.)
  versioningEnabled: boolean; // Enable API versioning
  mockAPI: boolean;          // Use mock or real API
  timeout: number;           // Request timeout (ms)
  retryAttempts: number;     // Retry failed requests
}
```

#### Auth Config:
```typescript
{
  tokenStorageKey: string;        // Access token storage key
  refreshTokenStorageKey: string; // Refresh token storage key  
  userStorageKey: string;         // User info storage key
  tokenRefreshBuffer: number;     // Refresh before expiry (ms)
}
```

### 🚨 Troubleshooting

#### Common Issues:

1. **CORS Errors:**
   - Đảm bảo backend cho phép CORS từ frontend domain
   - Kiểm tra preflight OPTIONS requests

2. **SSL Certificate:**
   - Trust self-signed certificates trong browser
   - Hoặc sử dụng HTTP cho development

3. **Token Expiry:**
   - Kiểm tra system time
   - Verify JWT token format và expiry

4. **Network Connection:**
   - Sử dụng API Connection Tester
   - Kiểm tra backend có đang chạy không

#### Debug Mode:
```bash
# Enable debug logging
REACT_APP_DEBUG=true npm start
```

### 📝 API Response Format

Tất cả API responses theo format:
```typescript
{
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

### 🔐 Security Features

- JWT token authentication
- Automatic token refresh
- Secure token storage
- Request/response interceptors
- CSRF protection ready
- XSS protection via React
