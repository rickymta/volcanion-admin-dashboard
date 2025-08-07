# 🚀 Quick Start Guide - CMS API với Google Authentication

## 1. Setup Database với Docker (Khuyến nghị)

```bash
# Khởi động MySQL và phpMyAdmin
docker-compose up -d

# Kiểm tra containers đang chạy
docker ps
```

**Thông tin kết nối:**
- MySQL: `localhost:3306`
- phpMyAdmin: `http://localhost:8080`
- Username: `cmsuser`
- Password: `cmspassword123`

## 2. Cấu hình Google OAuth

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable **Google+ API**
4. Tạo **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized origins: `http://localhost:3000`, `https://localhost:7081`
   - Redirect URIs: `http://localhost:3000/auth/callback`

5. Copy **Client ID** và cập nhật trong `appsettings.json`:
```json
"GoogleAuth": {
  "ClientId": "your-actual-google-client-id.apps.googleusercontent.com"
}
```

## 3. Chạy ứng dụng

### Sử dụng PowerShell Script (Khuyến nghị)
```powershell
# Chạy script setup (sẽ restore packages, tạo migration và update database)
.\setup-database.ps1

# Sau khi setup xong, chạy ứng dụng
cd CMSAPI
dotnet run
```

### Hoặc chạy từng bước thủ công
```bash
cd CMSAPI

# Restore packages
dotnet restore

# Tạo migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Chạy ứng dụng
dotnet run
```

## 4. Test API

### Swagger UI
Truy cập: `https://localhost:7081/swagger`

### Frontend Example
1. Mở file `frontend-example/index.html`
2. Cập nhật Google Client ID khi được hỏi
3. Test đăng nhập Google

## 5. API Endpoints chính

### 🔐 Authentication
- `POST /api/auth/google-login` - Đăng nhập Google
- `GET /api/auth/profile` - Lấy profile (cần token)

### 👤 User Management
- `GET /api/user/profile` - Lấy thông tin user hiện tại
- `PUT /api/user/profile` - Cập nhật profile
- `GET /api/user` - Lấy tất cả users

## 6. Database Schema

Bảng **Users** sẽ có cấu trúc:
```sql
CREATE TABLE Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    DateOfBirth DATETIME NULL,
    ProfilePictureUrl VARCHAR(500) NULL,
    Provider VARCHAR(50) NOT NULL DEFAULT 'Google',
    ProviderId VARCHAR(255) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY UK_Provider_ProviderId (Provider, ProviderId)
);
```

## 7. Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra MySQL container
docker logs cms-mysql

# Restart containers
docker-compose restart
```

### Lỗi migration
```bash
# Xóa migration và tạo lại
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Lỗi JWT
- Đảm bảo `SecretKey` có ít nhất 32 ký tự
- Kiểm tra `Issuer` và `Audience` trong cấu hình

## 8. Production Deployment

1. **Thay đổi cấu hình bảo mật:**
   - JWT Secret Key
   - Database password
   - Google Client ID/Secret

2. **Cấu hình CORS:**
   - Cập nhật allowed origins
   - Sử dụng HTTPS

3. **Environment Variables:**
   ```bash
   export JWT_SECRET="your-production-secret"
   export GOOGLE_CLIENT_ID="your-production-client-id"
   export DB_CONNECTION_STRING="your-production-db"
   ```

## ✅ Checklist

- [ ] Docker containers đang chạy
- [ ] Google OAuth đã cấu hình
- [ ] Database đã được tạo và migration
- [ ] Ứng dụng chạy thành công tại https://localhost:7081
- [ ] Swagger UI có thể truy cập
- [ ] Test đăng nhập Google thành công

**🎉 Xong! API của bạn đã sẵn sàng để sử dụng!**
