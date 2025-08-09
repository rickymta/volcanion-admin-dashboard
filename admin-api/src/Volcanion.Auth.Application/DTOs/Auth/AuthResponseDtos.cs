namespace Volcanion.Auth.Application.DTOs.Auth;

/// <summary>
/// Data transfer object for authentication responses
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// Gets or sets the JWT access token
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the refresh token for obtaining new access tokens
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the expiration date and time of the access token
    /// </summary>
    public DateTime ExpiresAt { get; set; }
    
    /// <summary>
    /// Gets or sets the authenticated user information
    /// </summary>
    public UserDto User { get; set; } = null!;
}

/// <summary>
/// Data transfer object for refresh token responses
/// </summary>
public class RefreshTokenResponseDto
{
    /// <summary>
    /// Gets or sets the new JWT access token
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the new refresh token
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the expiration date and time of the new access token
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}

/// <summary>
/// Data transfer object for user information
/// </summary>
public class UserDto
{
    /// <summary>
    /// Gets or sets the user's unique identifier
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Gets or sets the user's email address
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's phone number (optional)
    /// </summary>
    public string? PhoneNumber { get; set; }
    
    /// <summary>
    /// Gets or sets the user's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets the user's full name by combining first and last names
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string? Avatar { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool IsPhoneVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public ICollection<string> Roles { get; set; } = new List<string>();
    public ICollection<string> Permissions { get; set; } = new List<string>();
}
