namespace Volcanion.Auth.Domain.Entities;

/// <summary>
/// Represents a permission entity for fine-grained access control
/// </summary>
public class Permission
{
    /// <summary>
    /// Gets or sets the unique identifier for the permission
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Gets or sets the name of the permission (e.g., "CanReadUsers", "CanCreateProducts")
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the description of the permission (optional)
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Gets or sets the resource that this permission applies to (e.g., "Users", "Products")
    /// </summary>
    public string Resource { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the action allowed by this permission (e.g., "Read", "Write", "Delete")
    /// </summary>
    public string Action { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets a value indicating whether the permission is active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Gets or sets the date and time when the permission was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Gets or sets the date and time when the permission was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets the collection of role-permission associations
    /// </summary>
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
