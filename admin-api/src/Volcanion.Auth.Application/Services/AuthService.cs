using AutoMapper;
using FluentValidation;
using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.Exceptions;
using Volcanion.Auth.Application.Interfaces;
using Volcanion.Auth.Domain.Entities;
using Volcanion.Auth.Domain.Interfaces;
using Volcanion.Auth.Domain.ValueObjects;

namespace Volcanion.Auth.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ICacheService _cacheService;
    private readonly IPasswordService _passwordService;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly IValidator<LoginRequestDto> _loginValidator;
    private readonly IValidator<RegisterRequestDto> _registerValidator;

    public AuthService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IRefreshTokenRepository refreshTokenRepository,
        ICacheService cacheService,
        IPasswordService passwordService,
        ITokenService tokenService,
        IMapper mapper,
        IValidator<LoginRequestDto> loginValidator,
        IValidator<RegisterRequestDto> registerValidator)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _cacheService = cacheService;
        _passwordService = passwordService;
        _tokenService = tokenService;
        _mapper = mapper;
        _loginValidator = loginValidator;
        _registerValidator = registerValidator;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string? ipAddress = null, string? userAgent = null)
    {
        var validationResult = await _loginValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult.Errors.GroupBy(x => x.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray()));

        var user = await _userRepository.GetByEmailOrPhoneAsync(request.EmailOrPhone);
        if (user == null || !user.IsActive)
            throw new UnauthorizedException("Invalid credentials");

        if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials");

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Revoke existing tokens for this device if not remember me
        if (!request.RememberMe)
        {
            await _refreshTokenRepository.RevokeByDeviceIdAsync(user.Id, request.DeviceId, ipAddress);
        }

        // Generate tokens
        var roles = user.UserRoles.Where(ur => ur.IsActive).Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles.Where(ur => ur.IsActive)
            .SelectMany(ur => ur.Role.RolePermissions.Where(rp => rp.IsActive))
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email, roles, permissions);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            UserId = user.Id,
            DeviceId = request.DeviceId,
            DeviceName = request.DeviceName,
            UserAgent = userAgent,
            IpAddress = ipAddress,
            ExpiresAt = DateTime.UtcNow.AddDays(30) // 30 days
        };

        await _refreshTokenRepository.CreateAsync(refreshTokenEntity);

        // Cache user data
        await _cacheService.SetAsync($"user:{user.Id}", _mapper.Map<UserDto>(user), TimeSpan.FromMinutes(15));

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = _tokenService.GetTokenExpiration(accessToken),
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, string? ipAddress = null, string? userAgent = null)
    {
        var validationResult = await _registerValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult.Errors.GroupBy(x => x.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray()));

        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(request.Email))
            throw new ConflictException("Email already exists");

        // Check if phone number already exists
        if (!string.IsNullOrEmpty(request.PhoneNumber) && await _userRepository.PhoneNumberExistsAsync(request.PhoneNumber))
            throw new ConflictException("Phone number already exists");

        // Validate email
        var email = Email.Create(request.Email);

        // Validate phone number if provided
        string? normalizedPhone = null;
        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            var phone = PhoneNumber.Create(request.PhoneNumber);
            normalizedPhone = phone.Value;
        }

        // Create user
        var user = _mapper.Map<User>(request);
        user.Email = email.Value;
        user.PhoneNumber = normalizedPhone;
        user.PasswordHash = _passwordService.HashPassword(request.Password);

        user = await _userRepository.CreateAsync(user);

        // Assign default user role
        var defaultRole = await _roleRepository.GetByNameAsync("User");
        if (defaultRole != null)
        {
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = defaultRole.Id,
                AssignedAt = DateTime.UtcNow,
                IsActive = true
            };

            user.UserRoles.Add(userRole);
            await _userRepository.UpdateAsync(user);
        }

        // Generate tokens
        var roles = new List<string> { "User" };
        var permissions = defaultRole?.RolePermissions.Where(rp => rp.IsActive)
            .Select(rp => rp.Permission.Name).ToList() ?? new List<string>();

        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email, roles, permissions);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            UserId = user.Id,
            DeviceId = request.DeviceId,
            DeviceName = request.DeviceName,
            UserAgent = userAgent,
            IpAddress = ipAddress,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        await _refreshTokenRepository.CreateAsync(refreshTokenEntity);

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = _tokenService.GetTokenExpiration(accessToken),
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, string? ipAddress = null)
    {
        var refreshToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);
        if (refreshToken == null || !refreshToken.IsActive || refreshToken.DeviceId != request.DeviceId)
            throw new UnauthorizedException("Invalid refresh token");

        var user = refreshToken.User;
        if (!user.IsActive)
            throw new UnauthorizedException("User account is deactivated");

        // Generate new tokens
        var roles = user.UserRoles.Where(ur => ur.IsActive).Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles.Where(ur => ur.IsActive)
            .SelectMany(ur => ur.Role.RolePermissions.Where(rp => rp.IsActive))
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        var newAccessToken = _tokenService.GenerateAccessToken(user.Id, user.Email, roles, permissions);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        // Revoke old token and create new one
        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = ipAddress;
        refreshToken.ReplacedByToken = newRefreshToken;
        await _refreshTokenRepository.UpdateAsync(refreshToken);

        var newRefreshTokenEntity = new RefreshToken
        {
            Token = newRefreshToken,
            UserId = user.Id,
            DeviceId = request.DeviceId,
            DeviceName = refreshToken.DeviceName,
            UserAgent = refreshToken.UserAgent,
            IpAddress = ipAddress,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        await _refreshTokenRepository.CreateAsync(newRefreshTokenEntity);

        return new RefreshTokenResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = _tokenService.GetTokenExpiration(newAccessToken)
        };
    }

    public async Task LogoutAsync(LogoutRequestDto request, string? ipAddress = null)
    {
        await _refreshTokenRepository.RevokeAsync(request.RefreshToken, ipAddress);
    }

    public async Task LogoutAllDevicesAsync(LogoutAllRequestDto request, string? ipAddress = null)
    {
        var refreshToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);
        if (refreshToken != null)
        {
            await _refreshTokenRepository.RevokeAllByUserIdAsync(refreshToken.UserId, ipAddress);
            await _cacheService.RemoveAsync($"user:{refreshToken.UserId}");
        }
    }

    public Task<bool> ValidateTokenAsync(string token)
    {
        return Task.FromResult(_tokenService.ValidateToken(token));
    }
}
