# API Management System Documentation

## Tổng quan

Hệ thống API Management được thiết kế để quản lý tập trung tất cả các API calls trong ứng dụng React admin dashboard. Hệ thống này cung cấp:

- Quản lý token tự động (access token & refresh token)
- Error handling tập trung
- Retry logic cho network failures
- Type safety với TypeScript
- Pagination support
- Custom React hooks cho API operations
- Service separation theo domain

## Cấu trúc thư mục

```
src/api/
├── types.ts           # Định nghĩa types và interfaces
├── client.ts          # ApiClient class chính
├── endpoints.ts       # Cấu hình endpoints
├── index.ts           # ApiManager - quản lý tất cả services
└── services/          # Services theo từng domain
    ├── authService.ts
    ├── userService.ts
    ├── serviceService.ts
    ├── notificationService.ts
    └── analyticsService.ts

src/hooks/
└── useApi.ts         # Custom React hooks
```

## Core Components

### 1. ApiClient Class

```typescript
import apiManager from '../api';

// Automatic token handling
const response = await apiManager.users.getUsers();
```

**Features:**
- Automatic token refresh
- Request/response interceptors
- Error handling với retry logic
- Request queuing khi refresh token
- Timeout configuration

### 2. Services Pattern

Mỗi service class quản lý một domain cụ thể:

```typescript
// UserService
await apiManager.users.getUsers({ page: 1, limit: 10 });
await apiManager.users.createUser(userData);
await apiManager.users.updateUser(id, updateData);
await apiManager.users.deleteUser(id);

// AuthService
await apiManager.auth.login(credentials);
await apiManager.auth.refreshToken();
await apiManager.auth.logout();

// NotificationService
await apiManager.notifications.getRecentNotifications(5);
await apiManager.notifications.markAsRead(notificationId);
```

### 3. Custom React Hooks

#### useApi Hook
Cho simple API calls:

```typescript
import { useApi } from '../hooks/useApi';

const MyComponent = () => {
  const { data, loading, error, refetch } = useApi(
    () => apiManager.users.getProfile()
  );

  if (loading) return <CircularProgress />;
  if (error) return <Alert>{error.message}</Alert>;
  
  return <div>{data?.firstName}</div>;
};
```

#### usePaginatedApi Hook
Cho pagination:

```typescript
const {
  data: users,
  loading,
  error,
  pagination,
  loadMore,
  refresh,
  setPage
} = usePaginatedApi(
  (page, limit) => apiManager.users.getUsers({ page, limit }),
  1, // initial page
  10 // page size
);
```

#### useAsyncOperation Hook
Cho create, update, delete operations:

```typescript
const {
  loading: createLoading,
  error: createError,
  execute: createUser
} = useAsyncOperation((userData) =>
  apiManager.users.createUser(userData)
);

const handleSubmit = async () => {
  try {
    await createUser(formData);
    // Success handling
  } catch (error) {
    // Error đã được handle bởi hook
  }
};
```

## Type Definitions

### Core Types

```typescript
// API Response wrapper
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// Pagination
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error handling
interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}
```

### Domain-specific Types

```typescript
// User types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  role: 'admin' | 'user' | 'manager';
  isActive: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Service types  
interface ServiceInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  version: string;
  uptime: number;
  description?: string;
}
```

## Configuration

### API Endpoints

```typescript
// endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: { url: '/auth/login', method: 'POST' },
    REFRESH: { url: '/auth/refresh', method: 'POST' },
    LOGOUT: { url: '/auth/logout', method: 'POST' }
  },
  USERS: {
    LIST: { url: '/users', method: 'GET' },
    CREATE: { url: '/users', method: 'POST' },
    UPDATE: { url: '/users/:id', method: 'PUT' },
    DELETE: { url: '/users/:id', method: 'DELETE' }
  }
};
```

### Client Configuration

```typescript
const config = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
};
```

## Error Handling

Hệ thống có 3 tầng error handling:

### 1. Network Level (ApiClient)
- Connection errors
- Timeout errors  
- HTTP status errors (4xx, 5xx)
- Retry logic cho network failures

### 2. Authentication Level
- Token expiration handling
- Automatic refresh token
- Redirect to login khi không thể refresh

### 3. Application Level (Hooks)
- User-friendly error messages
- Error state management
- Optional error callbacks

```typescript
const { data, error } = useApi(
  () => apiManager.users.getUsers(),
  {
    onError: (error) => {
      // Custom error handling
      console.error('Failed to load users:', error);
    }
  }
);
```

## Best Practices

### 1. Service Organization
- Mỗi domain một service class
- Methods rõ ràng và consistent naming
- Return types được định nghĩa đầy đủ

### 2. Error Handling
- Luôn handle errors ở component level
- Cung cấp fallback UI cho error states
- Log errors cho debugging

### 3. Loading States
- Hiển thị loading indicators
- Disable actions khi đang loading
- Provide feedback cho user

### 4. Data Management
- Sử dụng hooks thay vì direct API calls
- Cache data khi có thể
- Refresh data khi cần thiết

## Examples

### Complete CRUD Example

```typescript
const UserManagement = () => {
  // Get users list
  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    refresh: refreshUsers
  } = usePaginatedApi(
    (page, limit) => apiManager.users.getUsers({ page, limit })
  );

  // Create user
  const {
    loading: createLoading,
    execute: createUser
  } = useAsyncOperation(
    (userData) => apiManager.users.createUser(userData)
  );

  // Update user
  const {
    loading: updateLoading,
    execute: updateUser
  } = useAsyncOperation(
    ({ id, userData }) => apiManager.users.updateUser(id, userData)
  );

  // Delete user
  const {
    loading: deleteLoading,
    execute: deleteUser
  } = useAsyncOperation(
    (id) => apiManager.users.deleteUser(id)
  );

  const handleCreate = async (userData) => {
    await createUser(userData);
    refreshUsers(); // Refresh list after create
  };

  const handleUpdate = async (id, userData) => {
    await updateUser({ id, userData });
    refreshUsers(); // Refresh list after update
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await deleteUser(id);
      refreshUsers(); // Refresh list after delete
    }
  };

  return (
    <div>
      {/* Users list UI */}
      {/* Create/Edit form UI */}
      {/* Delete confirmation UI */}
    </div>
  );
};
```

### Authentication Integration

```typescript
// Login component
const Login = () => {
  const dispatch = useAppDispatch();
  const { loading, execute: login } = useAsyncOperation(
    (credentials) => apiManager.auth.login(credentials)
  );

  const handleLogin = async (credentials) => {
    const response = await login(credentials);
    if (response) {
      dispatch(loginSuccess(response.data));
      // Redirect to dashboard
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
    </form>
  );
};
```

## Migration Guide

Nếu bạn đang migrate từ hệ thống cũ:

### From Direct Axios Calls

**Before:**
```typescript
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, []);
```

**After:**
```typescript
const { data: users, loading } = useApi(
  () => apiManager.users.getUsers()
);
```

### From Manual Token Management

**Before:**
```typescript
const token = localStorage.getItem('token');
const response = await axios.get('/api/users', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**After:**
```typescript
// Tokens được handle tự động
const response = await apiManager.users.getUsers();
```

## Troubleshooting

### Common Issues

1. **Token not refreshing**
   - Check refresh token expiration
   - Verify refresh endpoint configuration

2. **Network timeouts**
   - Adjust timeout configuration
   - Check retry settings

3. **Type errors**
   - Ensure proper interface definitions
   - Update service method signatures

4. **Hook dependency warnings**
   - Use callback version of API functions
   - Properly handle cleanup in useEffect

### Debug Mode

Enable debug mode để xem detailed logs:

```typescript
// In development
apiManager.enableDebugMode();
```

## Future Enhancements

- [ ] Offline support với cache
- [ ] Request deduplication
- [ ] GraphQL support
- [ ] Real-time subscriptions
- [ ] Advanced caching strategies
- [ ] Request/response interceptor plugins
