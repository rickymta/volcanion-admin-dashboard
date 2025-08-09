using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.DTOs.User;

namespace Volcanion.Auth.Application.Interfaces;

/// <summary>
/// Service interface for user management operations
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Retrieves a user by their unique identifier
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <returns>The user information if found; otherwise, null</returns>
    Task<UserDto?> GetUserByIdAsync(Guid userId);
    
    /// <summary>
    /// Retrieves the current user's information
    /// </summary>
    /// <param name="userId">The current user identifier</param>
    /// <returns>The current user information if found; otherwise, null</returns>
    Task<UserDto?> GetCurrentUserAsync(Guid userId);
    
    /// <summary>
    /// Updates a user's profile information
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <param name="request">The update request containing new user information</param>
    /// <returns>The updated user information</returns>
    Task<UpdateUserResponseDto> UpdateUserAsync(Guid userId, UpdateUserRequestDto request);
    
    /// <summary>
    /// Changes a user's password
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <param name="request">The password change request containing old and new passwords</param>
    /// <returns>True if the password was changed successfully; otherwise, false</returns>
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request);
    
    /// <summary>
    /// Deactivates a user account
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <returns>True if the user was deactivated successfully; otherwise, false</returns>
    Task<bool> DeactivateUserAsync(Guid userId);
    
    /// <summary>
    /// Activates a user account
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <returns>True if the user was activated successfully; otherwise, false</returns>
    Task<bool> ActivateUserAsync(Guid userId);
}
