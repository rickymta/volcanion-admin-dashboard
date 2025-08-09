using Volcanion.Auth.Application.DTOs.Auth;

namespace Volcanion.Auth.Application.Interfaces;

/// <summary>
/// Service interface for authentication operations
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Authenticates a user with email/phone and password
    /// </summary>
    /// <param name="request">The login request containing credentials</param>
    /// <param name="ipAddress">The client IP address (optional)</param>
    /// <param name="userAgent">The client user agent (optional)</param>
    /// <returns>Authentication response with tokens and user information</returns>
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string? ipAddress = null, string? userAgent = null);
    
    /// <summary>
    /// Registers a new user account
    /// </summary>
    /// <param name="request">The registration request containing user details</param>
    /// <param name="ipAddress">The client IP address (optional)</param>
    /// <param name="userAgent">The client user agent (optional)</param>
    /// <returns>Authentication response with tokens and user information</returns>
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, string? ipAddress = null, string? userAgent = null);
    
    /// <summary>
    /// Refreshes an access token using a valid refresh token
    /// </summary>
    /// <param name="request">The refresh token request</param>
    /// <param name="ipAddress">The client IP address (optional)</param>
    /// <returns>New access and refresh tokens</returns>
    Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, string? ipAddress = null);
    
    /// <summary>
    /// Logs out a user from a specific device
    /// </summary>
    /// <param name="request">The logout request containing device information</param>
    /// <param name="ipAddress">The client IP address (optional)</param>
    /// <returns>A task representing the asynchronous operation</returns>
    Task LogoutAsync(LogoutRequestDto request, string? ipAddress = null);
    
    /// <summary>
    /// Logs out a user from all devices
    /// </summary>
    /// <param name="request">The logout all devices request</param>
    /// <param name="ipAddress">The client IP address (optional)</param>
    /// <returns>A task representing the asynchronous operation</returns>
    Task LogoutAllDevicesAsync(LogoutAllRequestDto request, string? ipAddress = null);
    
    /// <summary>
    /// Validates if a JWT token is valid and not expired
    /// </summary>
    /// <param name="token">The JWT token to validate</param>
    /// <returns>True if the token is valid; otherwise, false</returns>
    Task<bool> ValidateTokenAsync(string token);
}
