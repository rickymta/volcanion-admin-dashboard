namespace Volcanion.Auth.Domain.Entities;

/// <summary>
/// Represents a refresh token for JWT authentication with multi-device support
/// </summary>
public class RefreshToken
{
    /// <summary>
    /// Gets or sets the unique identifier for the refresh token
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Gets or sets the user identifier that owns this refresh token
    /// </summary>
    public Guid UserId { get; set; }
    
    /// <summary>
    /// Gets or sets the refresh token value
    /// </summary>
    public string Token { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the device identifier for multi-device authentication
    /// </summary>
    public string DeviceId { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the device name (optional, for user-friendly display)
    /// </summary>
    public string? DeviceName { get; set; }
    
    /// <summary>
    /// Gets or sets the user agent string from the client (optional)
    /// </summary>
    public string? UserAgent { get; set; }
    
    /// <summary>
    /// Gets or sets the IP address from which the token was created (optional)
    /// </summary>
    public string? IpAddress { get; set; }
    
    /// <summary>
    /// Gets or sets the date and time when the token was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Gets or sets the date and time when the token expires
    /// </summary>
    public DateTime ExpiresAt { get; set; }
    
    /// <summary>
    /// Gets or sets the date and time when the token was used (optional)
    /// </summary>
    public DateTime? UsedAt { get; set; }
    
    /// <summary>
    /// Gets or sets the date and time when the token was revoked (optional)
    /// </summary>
    public DateTime? RevokedAt { get; set; }
    
    /// <summary>
    /// Gets or sets the IP address from which the token was revoked (optional)
    /// </summary>
    public string? RevokedByIp { get; set; }
    
    /// <summary>
    /// Gets or sets the token that replaced this token (optional)
    /// </summary>
    public string? ReplacedByToken { get; set; }
    
    /// <summary>
    /// Gets a value indicating whether the token is expired
    /// </summary>
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    
    /// <summary>
    /// Gets a value indicating whether the token is revoked
    /// </summary>
    public bool IsRevoked => RevokedAt != null;
    
    /// <summary>
    /// Gets a value indicating whether the token is active (not revoked and not expired)
    /// </summary>
    public bool IsActive => !IsRevoked && !IsExpired;

    /// <summary>
    /// Gets or sets the user entity that owns this refresh token
    /// </summary>
    public User User { get; set; } = null!;
}
