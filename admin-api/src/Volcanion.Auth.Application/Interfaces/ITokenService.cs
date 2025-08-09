using System.Security.Claims;

namespace Volcanion.Auth.Application.Interfaces;

/// <summary>
/// Service interface for JWT token operations
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generates a JWT access token with user claims
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <param name="email">The user's email address</param>
    /// <param name="roles">The user's roles</param>
    /// <param name="permissions">The user's permissions</param>
    /// <returns>A JWT access token string</returns>
    string GenerateAccessToken(Guid userId, string email, IEnumerable<string> roles, IEnumerable<string> permissions);
    
    /// <summary>
    /// Generates a random refresh token
    /// </summary>
    /// <returns>A refresh token string</returns>
    string GenerateRefreshToken();
    
    /// <summary>
    /// Extracts claims principal from a JWT token
    /// </summary>
    /// <param name="token">The JWT token</param>
    /// <returns>The claims principal if valid; otherwise, null</returns>
    ClaimsPrincipal? GetPrincipalFromToken(string token);
    
    /// <summary>
    /// Validates if a JWT token is valid and not expired
    /// </summary>
    /// <param name="token">The JWT token to validate</param>
    /// <returns>True if the token is valid; otherwise, false</returns>
    bool ValidateToken(string token);
    
    /// <summary>
    /// Gets the expiration date and time from a JWT token
    /// </summary>
    /// <param name="token">The JWT token</param>
    /// <returns>The expiration date and time</returns>
    DateTime GetTokenExpiration(string token);
}
