using Volcanion.Auth.Domain.Entities;

namespace Volcanion.Auth.Domain.Interfaces;

/// <summary>
/// Repository interface for role entity operations
/// </summary>
public interface IRoleRepository
{
    /// <summary>
    /// Retrieves a role by its unique identifier
    /// </summary>
    /// <param name="id">The role identifier</param>
    /// <returns>The role if found; otherwise, null</returns>
    Task<Role?> GetByIdAsync(Guid id);
    
    /// <summary>
    /// Retrieves a role by its name
    /// </summary>
    /// <param name="name">The role name</param>
    /// <returns>The role if found; otherwise, null</returns>
    Task<Role?> GetByNameAsync(string name);
    
    /// <summary>
    /// Retrieves all roles
    /// </summary>
    /// <returns>A collection of all roles</returns>
    Task<IEnumerable<Role>> GetAllAsync();
    
    /// <summary>
    /// Retrieves all roles assigned to a specific user
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <returns>A collection of roles assigned to the user</returns>
    Task<IEnumerable<Role>> GetByUserIdAsync(Guid userId);
    
    /// <summary>
    /// Creates a new role
    /// </summary>
    /// <param name="role">The role to create</param>
    /// <returns>The created role</returns>
    Task<Role> CreateAsync(Role role);
    
    /// <summary>
    /// Updates an existing role
    /// </summary>
    /// <param name="role">The role to update</param>
    /// <returns>The updated role</returns>
    Task<Role> UpdateAsync(Role role);
    
    /// <summary>
    /// Deletes a role by its identifier
    /// </summary>
    /// <param name="id">The role identifier</param>
    /// <returns>A task representing the asynchronous operation</returns>
    Task DeleteAsync(Guid id);
    
    /// <summary>
    /// Checks if a role exists by its identifier
    /// </summary>
    /// <param name="id">The role identifier</param>
    /// <returns>True if the role exists; otherwise, false</returns>
    Task<bool> ExistsAsync(Guid id);
    
    /// <summary>
    /// Checks if a role name is already in use
    /// </summary>
    /// <param name="name">The role name to check</param>
    /// <returns>True if the role name exists; otherwise, false</returns>
    Task<bool> NameExistsAsync(string name);
}
