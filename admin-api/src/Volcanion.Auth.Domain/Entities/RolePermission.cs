namespace Volcanion.Auth.Domain.Entities;

/// <summary>
/// Represents the many-to-many relationship between roles and permissions
/// </summary>
public class RolePermission
{
    /// <summary>
    /// Gets or sets the role identifier
    /// </summary>
    public Guid RoleId { get; set; }
    
    /// <summary>
    /// Gets or sets the permission identifier
    /// </summary>
    public Guid PermissionId { get; set; }
    
    /// <summary>
    /// Gets or sets the date and time when the permission was granted to the role
    /// </summary>
    public DateTime GrantedAt { get; set; }
    
    /// <summary>
    /// Gets or sets a value indicating whether this role-permission assignment is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the role entity
    /// </summary>
    public Role Role { get; set; } = null!;
    
    /// <summary>
    /// Gets or sets the permission entity
    /// </summary>
    public Permission Permission { get; set; } = null!;
}
