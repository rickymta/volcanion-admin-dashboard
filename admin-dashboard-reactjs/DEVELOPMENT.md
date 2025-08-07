# 🚀 Development Workflow - API Integration

## 📋 Tổng Quan

AuthSlice hiện tại đã được triển khai hoàn chỉnh với khả năng chuyển đổi giữa **Mock API** và **Real API** thông qua configuration.

## 🔧 API Mode Switching

### Quick Commands:
```bash
# Kiểm tra mode hiện tại
npm run api:status

# Chuyển sang Mock API (development)
npm run api:mock

# Chuyển sang Real API (production)
npm run api:real
```

### Manual Configuration:
Trong file `.env`:
```bash
# Mock API Mode
REACT_APP_MOCK_API=true
REACT_APP_API_URL=http://localhost:3001/api

# Real API Mode  
REACT_APP_MOCK_API=false
REACT_APP_API_URL=https://localhost:7258/api
```

## 🔐 Authentication Flow

### Current Implementation:

#### AuthSlice Features:
- ✅ **Dual Mode Support**: Mock API ↔️ Real API switching
- ✅ **Enhanced Logging**: Console logs để track API calls
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Token Management**: Automatic localStorage persistence
- ✅ **Token Refresh**: Auto refresh với real API integration

#### API Calls:
```typescript
// Login (Mock vs Real)
if (config.api.mockAPI) {
  response = await mockLoginAPI(credentials);        // Mock
} else {
  response = await apiManager.auth.login(credentials); // Real API
}

// Token Refresh (Mock vs Real)  
if (config.api.mockAPI) {
  response = await mockRefreshTokenAPI(refreshToken);  // Mock
} else {
  response = await apiManager.auth.refreshToken(token); // Real API
}
```

## 🌐 Real API Integration

### Endpoints:
- **Login**: `POST https://localhost:7258/api/v1/auth/login`
- **Refresh**: `POST https://localhost:7258/api/v1/auth/refresh-token`
- **Current User**: `GET https://localhost:7258/api/v1/auth/me`
- **Logout**: `POST https://localhost:7258/api/v1/auth/logout`

### Request/Response Format:
```typescript
// Login Request
{
  email: string;
  password: string;
}

// Login Response  
{
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}
```

## 🧪 Testing

### Mock API Testing:
```bash
npm run api:mock
npm start
```
- Credentials: `john.doe@volcanion.com` / `password123`
- Automatic token refresh every 14 minutes
- Console logs: `🔧 Using Mock API for login`

### Real API Testing:
```bash
npm run api:real
npm start  
```
- Use your backend credentials
- JWT-based token refresh
- Console logs: `🌐 Using Real API for login`

### API Connection Tester:
Navigate to `/api-connection-tester` để:
- ✅ Test network connectivity
- ✅ Validate API endpoints  
- ✅ Check authentication flow
- ✅ Monitor token refresh

## 🔍 Debugging

### Console Logs:
- `🔧 Using Mock API for login` - Mock mode active
- `🌐 Using Real API for login` - Real mode active  
- `Login error:` - Authentication errors
- `Token refresh error:` - Refresh token errors

### Browser DevTools:
- **Application Tab**: Check localStorage for tokens
- **Network Tab**: Monitor API requests
- **Console**: View authentication flow logs

## ⚡ Development Tips

### 1. **Development Setup**:
```bash
# Start with Mock API
npm run api:mock
npm start

# Test login với demo credentials
# Switch to Real API when backend is ready
npm run api:real
```

### 2. **Backend Integration**:
- Ensure backend runs on `https://localhost:7258`
- Trust SSL certificate for localhost
- Verify CORS configuration
- Check API response format matches interface

### 3. **Token Management**:
- Access tokens stored in Redux + localStorage
- Refresh tokens stored in localStorage only
- Auto-refresh 5 minutes before expiry
- Fallback to 14-minute refresh for mock tokens

## 🚨 Common Issues & Solutions

### Issue: "Network Error"
```bash
# Check API mode
npm run api:status

# Switch to appropriate mode
npm run api:mock  # or api:real

# Restart development server
npm start
```

### Issue: "Login Failed"
- **Mock API**: Use `john.doe@volcanion.com` / `password123`
- **Real API**: Verify backend is running and credentials are correct

### Issue: "Token Refresh Failed"  
- **Mock API**: Should work automatically
- **Real API**: Check refresh endpoint and token format

### Issue: "CORS Error"
- Configure backend to allow `http://localhost:3000`
- Add proper CORS headers
- Use HTTPS for production

## 📁 File Structure

```
src/
├── store/slices/authSlice.ts     # ✅ Complete auth logic
├── api/                          # ✅ API client & services  
├── config/index.ts              # ✅ Configuration management
└── hooks/useTokenRefresh.ts     # ✅ Auto token refresh

scripts/
└── api-switcher.js              # ✅ Mode switching utility
```

## 🎯 Next Steps

1. **Backend Integration**: Test với real backend APIs
2. **Error Handling**: Enhance user feedback
3. **Security**: Add CSRF protection
4. **Performance**: Optimize token refresh logic
5. **Testing**: Add unit tests for auth flows

---

**Status**: ✅ **Authentication HOÀN THÀNH** với đầy đủ Mock/Real API support!
