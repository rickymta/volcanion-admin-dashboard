namespace Volcanion.Auth.Domain.Entities;

/// <summary>
/// Represents the many-to-many relationship between users and roles
/// </summary>
public class UserRole
{
    /// <summary>
    /// Gets or sets the user identifier
    /// </summary>
    public Guid UserId { get; set; }
    
    /// <summary>
    /// Gets or sets the role identifier
    /// </summary>
    public Guid RoleId { get; set; }
    
    /// <summary>
    /// Gets or sets the date and time when the role was assigned to the user
    /// </summary>
    public DateTime AssignedAt { get; set; }
    
    /// <summary>
    /// Gets or sets the expiration date and time for this role assignment (optional)
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
    
    /// <summary>
    /// Gets or sets a value indicating whether this user-role assignment is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the user entity
    /// </summary>
    public User User { get; set; } = null!;
    
    /// <summary>
    /// Gets or sets the role entity
    /// </summary>
    public Role Role { get; set; } = null!;
}
