# CMS API - Google Authentication Setup Guide

## 1. Prerequisites

### .NET 8 SDK
- Tải và cài đặt .NET 8 SDK từ: https://dotnet.microsoft.com/download/dotnet/8.0

### MySQL Database
- Cài đặt MySQL Server
- Tạo database: `cmsdb` (production) và `cmsdb_dev` (development)

## 2. Google OAuth Setup

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo hoặc chọn một project
3. Enable Google+ API
4. Tạo OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000` (frontend URL)
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`
5. Copy Client ID và cập nhật trong `appsettings.json`

## 3. Configuration

### Database Connection
Cập nhật connection string trong `appsettings.json` và `appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=cmsdb;User=your_username;Password=your_password;"
}
```

### Google Client ID
Cập nhật Google Client ID trong cấu hình:

```json
"GoogleAuth": {
  "ClientId": "your-google-client-id.apps.googleusercontent.com"
}
```

### JWT Secret Key
Đổi secret key trong production:

```json
"JwtSettings": {
  "SecretKey": "your-super-secret-key-that-is-at-least-32-characters-long"
}
```

## 4. Installation & Running

### Install packages
```bash
cd CMSAPI
dotnet restore
```

### Install Entity Framework CLI
```bash
dotnet tool install --global dotnet-ef
```

### Create and run migrations
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Run the application
```bash
dotnet run
```

API sẽ chạy tại: `https://localhost:7081` hoặc `http://localhost:5081`

## 5. API Endpoints

### POST `/api/auth/google-login`
Đăng nhập bằng Google ID Token

**Request Body:**
```json
{
  "idToken": "google-id-token-here"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "dateOfBirth": null,
    "profilePictureUrl": "https://profile-picture-url",
    "provider": "Google",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET `/api/auth/profile`
Lấy thông tin profile (cần JWT token)

**Headers:**
```
Authorization: Bearer your-jwt-token
```

## 6. Frontend Integration Example

### HTML + JavaScript
```html
<!-- Include Google Sign-In library -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<div id="g_id_onload"
     data-client_id="your-google-client-id"
     data-context="signin"
     data-ux_mode="popup"
     data-callback="handleCredentialResponse">
</div>

<div class="g_id_signin"
     data-type="standard"
     data-shape="rectangular"
     data-theme="outline"
     data-text="signin_with"
     data-size="large">
</div>

<script>
function handleCredentialResponse(response) {
  // Send the ID token to your backend
  fetch('/api/auth/google-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idToken: response.credential
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      // Save JWT token
      localStorage.setItem('authToken', data.token);
      console.log('Login successful:', data.user);
    }
  })
  .catch(error => console.error('Error:', error));
}
</script>
```

## 7. Database Schema

Bảng `Users` sẽ được tạo với cấu trúc:

- `Id` (int, primary key, auto-increment)
- `Email` (varchar(255), unique, required)
- `FirstName` (varchar(100), required)
- `LastName` (varchar(100), required) 
- `DateOfBirth` (datetime, nullable)
- `ProfilePictureUrl` (varchar(500), nullable)
- `Provider` (varchar(50), required, default: "Google")
- `ProviderId` (varchar(255), required)
- `CreatedAt` (datetime, required)
- `UpdatedAt` (datetime, required)

## 8. Security Notes

- Luôn sử dụng HTTPS trong production
- Đổi JWT secret key thành một chuỗi phức tạp
- Cấu hình CORS phù hợp với domain frontend
- Xác thực Google ID token ở backend để đảm bảo bảo mật
- Sử dụng environment variables cho các thông tin nhạy cảm

## 9. Testing

Sử dụng Swagger UI tại `https://localhost:7081/swagger` để test các API endpoints.

Đối với endpoint `/api/auth/google-login`, bạn cần có một Google ID token hợp lệ để test.
