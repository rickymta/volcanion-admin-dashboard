# Angular Material Admin Dashboard

Ứng dụng quản trị viên (Admin Dashboard) được xây dựng bằng Angular 20 và Angular Material UI với đầy đủ các tính năng hiện đại.

## ✨ Tính năng chính

### 🔐 Xác thực và Phân quyền
- ✅ Đăng nhập, đăng ký, đăng xuất
- ✅ Quản lý JWT Access Token và Refresh Token
- ✅ Hệ thống phân quyền RBAC (Role-Based Access Control)
- ✅ Route guards và permission guards

### 📊 Quản lý dữ liệu
- ✅ Data Table với phân trang, tìm kiếm, sắp xếp
- ✅ Bulk actions (thao tác hàng loạt)
- ✅ Export/Import dữ liệu
- ✅ Quản lý API tập trung

### ⚙️ Cấu hình hệ thống
- ✅ Quản lý cấu hình hệ thống tập trung
- ✅ Phân loại cấu hình theo danh mục
- ✅ Hỗ trợ nhiều loại dữ liệu (String, Number, Boolean, JSON)

### 🎨 Giao diện người dùng
- ✅ Dark mode và Light mode
- ✅ Responsive design
- ✅ Material Design UI
- ✅ Sidebar có thể thu gọn
- ✅ Notifications system

### 👤 Quản lý người dùng
- ✅ CRUD operations cho người dùng
- ✅ Quản lý thông tin cá nhân
- ✅ Thay đổi mật khẩu
- ✅ Upload và quản lý avatar
- ✅ Phân quyền chi tiết

## 🚀 Cài đặt và chạy

### Prerequisites
- Node.js (>= 18.x)
- npm hoặc yarn
- Angular CLI

### Cài đặt dependencies
```bash
npm install
```

### Khởi chạy ứng dụng
```bash
ng serve
```

Ứng dụng sẽ chạy tại `http://localhost:4200`

### Build production
```bash
ng build --prod
```

## 🏗️ Cấu trúc project

```
src/
├── app/
│   ├── core/                 # Core modules và services
│   │   ├── guards/          # Route guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # Business logic services
│   ├── shared/              # Shared components
│   │   └── components/      # Reusable components
│   ├── features/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── dashboard/      # Dashboard
│   │   ├── users/          # User management
│   │   └── settings/       # System settings
│   ├── layout/             # Layout components
│   └── app.routes.ts       # Routing configuration
├── styles.scss             # Global styles
└── index.html
```

## 🔧 Cấu hình

### Environment
Tạo file `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  enableLogging: true
};
```

### API Integration
Cập nhật URL API trong các services:
- `AuthService`: `/api/auth`
- `UserService`: `/api/users`
- `ConfigService`: `/api/configs`

## 📱 Responsive Design

Ứng dụng được thiết kế responsive và hoạt động tốt trên:
- ✅ Desktop (>= 1024px)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (< 768px)

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage
- Protected routes

### Authorization
- Role-based access control
- Permission-based route guards
- Menu visibility based on permissions

## 🎨 Themes

### Light Theme
- Primary: Indigo (#3f51b5)
- Accent: Pink (#ff4081)
- Background: Light gray (#fafafa)

### Dark Theme
- Primary: Purple (#bb86fc)
- Accent: Teal (#03dac6)
- Background: Dark (#121212)

## 📊 Components chính

### DataTableComponent
Một component table có đầy đủ tính năng:
- Phân trang
- Tìm kiếm
- Sắp xếp
- Selection (single/multiple)
- Bulk actions
- Custom templates

```typescript
<app-data-table
  [data]="users"
  [columns]="columns"
  [loading]="loading"
  [totalCount]="totalCount"
  [selectable]="true"
  [searchable]="true"
  [rowActions]="rowActions"
  (action)="onTableAction($event)">
</app-data-table>
```

### MainLayoutComponent
Layout chính với:
- Sidebar navigation
- Top toolbar
- Theme toggle
- User menu
- Notifications

## 🛠️ Services

### AuthService
- `login(credentials)`: Đăng nhập
- `register(userData)`: Đăng ký
- `logout()`: Đăng xuất
- `refreshToken()`: Làm mới token
- `hasPermission(permission)`: Kiểm tra quyền

### UserService
- `getUsers(pageRequest, filters)`: Lấy danh sách người dùng
- `createUser(userData)`: Tạo người dùng mới
- `updateUser(id, userData)`: Cập nhật người dùng
- `deleteUser(id)`: Xóa người dùng

### ThemeService
- `toggleTheme()`: Chuyển đổi theme
- `setTheme(theme)`: Đặt theme
- `updateSettings(settings)`: Cập nhật cài đặt

### ConfigService
- `getConfigs(pageRequest, filters)`: Lấy cấu hình
- `createConfig(configData)`: Tạo cấu hình mới
- `updateConfig(id, configData)`: Cập nhật cấu hình

## 🔍 Guards

### AuthGuard
Bảo vệ các route yêu cầu đăng nhập

### RoleGuard
Bảo vệ các route yêu cầu quyền cụ thể

```typescript
{
  path: 'users',
  component: UserListComponent,
  canActivate: [RoleGuard],
  data: { permissions: ['users.read'] }
}
```

## 🚦 Interceptors

### AuthInterceptor
- Tự động thêm JWT token vào headers
- Xử lý token refresh khi hết hạn

### ErrorInterceptor
- Xử lý lỗi HTTP tập trung
- Hiển thị thông báo lỗi user-friendly

### LoadingInterceptor
- Quản lý trạng thái loading global

## 📝 Models

### User Model
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### SystemConfig Model
```typescript
interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  type: ConfigType;
  category: string;
  isReadOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎯 TODO / Roadmap

- [ ] User profile management với upload avatar
- [ ] Role và permission management UI
- [ ] System logs viewer
- [ ] Dashboard analytics charts
- [ ] Email templates management
- [ ] File management system
- [ ] Notification center
- [ ] Audit trail
- [ ] Two-factor authentication
- [ ] Advanced search và filters

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Nếu bạn có bất kỳ câu hỏi nào, vui lòng tạo issue hoặc liên hệ qua email.

---

**Happy coding! 🚀**
