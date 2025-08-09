# Volcanion.Auth.Api

Authentication and Authorization API built with .NET 8 using Domain-Driven Design (DDD) architecture.

## Features

- **User Authentication**: Login/Register with email or Vietnamese phone number
- **Multi-device Support**: Login on multiple devices with device management
- **JWT Tokens**: Access token and refresh token implementation
- **Role-based Access Control (RBAC)**: Permission-based authorization
- **Redis Caching**: High-performance caching for user data and sessions
- **MySQL Database**: Entity Framework Core with MySQL provider
- **Password Security**: Secure password hashing with PBKDF2
- **Device Management**: Logout from specific devices or all devices
- **Comprehensive Logging**: Structured logging with Serilog

## Architecture

The project follows Domain-Driven Design principles with clean architecture:

```
├── src/
│   ├── Volcanion.Auth.Domain/          # Domain layer (Entities, Value Objects, Interfaces)
│   ├── Volcanion.Auth.Application/     # Application layer (Services, DTOs, Validators)
│   ├── Volcanion.Auth.Infrastructure/  # Infrastructure layer (Data, Repositories, External Services)
│   └── Volcanion.Auth.Api/             # Presentation layer (Controllers, Middleware)
```

## Technologies Used

- **.NET 8**: Latest .NET framework
- **Entity Framework Core**: ORM with MySQL provider (Pomelo)
- **MySQL**: Primary database
- **Redis**: Caching and session storage
- **JWT**: Authentication tokens
- **AutoMapper**: Object mapping
- **FluentValidation**: Input validation
- **Serilog**: Structured logging
- **Swagger/OpenAPI**: API documentation

## Prerequisites

- .NET 8 SDK
- MySQL Server
- Redis Server
- Visual Studio 2022 or VS Code

## Configuration

Update `appsettings.json` with your database and Redis connection strings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=VolcanionAuth;User=root;Password=yourpassword;",
    "Redis": "localhost:6379"
  },
  "JWT": {
    "Secret": "YourSuperSecretKeyThatIsAtLeast256BitsLongForHMACSecurityRequirements",
    "Issuer": "VolcanionAuthAPI",
    "Audience": "VolcanionAuthAPI",
    "AccessTokenExpiryMinutes": 15,
    "RefreshTokenExpiryDays": 30
  }
}
```

## Database Setup

1. Install EF Core tools:
```bash
dotnet tool install --global dotnet-ef
```

2. Create and apply migrations:
```bash
dotnet ef migrations add InitialCreate --project src/Volcanion.Auth.Infrastructure --startup-project src/Volcanion.Auth.Api
dotnet ef database update --project src/Volcanion.Auth.Infrastructure --startup-project src/Volcanion.Auth.Api
```

## Running the Application

```bash
cd src/Volcanion.Auth.Api
dotnet run
```

The API will be available at:
- HTTPS: `https://localhost:7000`
- HTTP: `http://localhost:5000`
- Swagger UI: `https://localhost:7000/swagger`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout from current device
- `POST /api/auth/logout-all` - Logout from all devices
- `GET /api/auth/validate-token` - Validate token

### User Management
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/change-password` - Change password
- `GET /api/user/{id}` - Get user by ID (Admin only)
- `POST /api/user/{id}/activate` - Activate user (Admin only)
- `POST /api/user/{id}/deactivate` - Deactivate user (Admin only)

## Request/Response Examples

### Register
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "phoneNumber": "+84901234567",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "deviceId": "device-unique-id",
  "deviceName": "iPhone 15"
}
```

### Login
```json
POST /api/auth/login
{
  "emailOrPhone": "user@example.com",
  "password": "SecurePass123!",
  "deviceId": "device-unique-id",
  "deviceName": "iPhone 15",
  "rememberMe": true
}
```

### Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "base64-encoded-refresh-token",
  "expiresAt": "2025-08-09T13:00:00Z",
  "user": {
    "id": "guid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["User"],
    "permissions": ["profile.read", "profile.write"]
  }
}
```

## Default Users and Roles

The system creates default roles on startup:
- **Admin**: Full system access
- **User**: Basic user permissions

Default permissions include:
- `users.read`, `users.write`, `users.delete`
- `roles.read`, `roles.write`, `roles.delete`
- `profile.read`, `profile.write`

## Phone Number Validation

The system supports Vietnamese phone number formats:
- Mobile operators: Viettel, Vinaphone, Mobifone, Vietnamobile
- Formats: `+84xxxxxxxxx`, `84xxxxxxxxx`, `0xxxxxxxxx`
- Auto-normalization to international format

## Security Features

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **JWT Security**: RS256 algorithm with configurable expiration
- **Refresh Token Rotation**: New refresh token issued on each refresh
- **Device Tracking**: Track and manage user sessions by device
- **IP Logging**: Log IP addresses for security auditing

## Development

### Building
```bash
dotnet build
```

### Testing
```bash
dotnet test
```

### Code Quality
- Follow DDD principles
- Use dependency injection
- Implement proper exception handling
- Write comprehensive unit tests
- Follow SOLID principles

## License

This project is licensed under the MIT License.
