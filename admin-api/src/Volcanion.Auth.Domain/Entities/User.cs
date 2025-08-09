namespace Volcanion.Auth.Domain.Entities;

/// <summary>
/// Represents a user entity in the authentication system
/// </summary>
public class User
{
    /// <summary>
    /// Gets or sets the unique identifier for the user
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Gets or sets the user's email address
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's phone number (optional, for Vietnamese phone numbers)
    /// </summary>
    public string? PhoneNumber { get; set; }
    
    /// <summary>
    /// Gets or sets the hashed password for user authentication
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's avatar URL (optional)
    /// </summary>
    public string? Avatar { get; set; }
    
    /// <summary>
    /// Gets or sets a value indicating whether the user's email is verified
    /// </summary>
    public bool IsEmailVerified { get; set; }
    
    /// <summary>
    /// Gets or sets a value indicating whether the user's phone number is verified
    /// </summary>
    public bool IsPhoneVerified { get; set; }
    
    /// <summary>
    /// Gets or sets a value indicating whether the user account is active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Gets or sets the date and time when the user account was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Gets or sets the date and time when the user account was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// Gets or sets the date and time of the user's last login (optional)
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Gets or sets the collection of user roles for role-based access control
    /// </summary>
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    
    /// <summary>
    /// Gets or sets the collection of refresh tokens associated with this user
    /// </summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
