using Volcanion.Auth.Domain.Entities;

namespace Volcanion.Auth.Domain.Interfaces;

/// <summary>
/// Repository interface for user entity operations
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Retrieves a user by their unique identifier
    /// </summary>
    /// <param name="id">The user identifier</param>
    /// <returns>The user if found; otherwise, null</returns>
    Task<User?> GetByIdAsync(Guid id);
    
    /// <summary>
    /// Retrieves a user by their email address
    /// </summary>
    /// <param name="email">The email address</param>
    /// <returns>The user if found; otherwise, null</returns>
    Task<User?> GetByEmailAsync(string email);
    
    /// <summary>
    /// Retrieves a user by their phone number
    /// </summary>
    /// <param name="phoneNumber">The phone number</param>
    /// <returns>The user if found; otherwise, null</returns>
    Task<User?> GetByPhoneNumberAsync(string phoneNumber);
    
    /// <summary>
    /// Retrieves a user by either email address or phone number
    /// </summary>
    /// <param name="emailOrPhone">The email address or phone number</param>
    /// <returns>The user if found; otherwise, null</returns>
    Task<User?> GetByEmailOrPhoneAsync(string emailOrPhone);
    
    /// <summary>
    /// Retrieves all users
    /// </summary>
    /// <returns>A collection of all users</returns>
    Task<IEnumerable<User>> GetAllAsync();
    
    /// <summary>
    /// Creates a new user
    /// </summary>
    /// <param name="user">The user to create</param>
    /// <returns>The created user</returns>
    Task<User> CreateAsync(User user);
    
    /// <summary>
    /// Updates an existing user
    /// </summary>
    /// <param name="user">The user to update</param>
    /// <returns>The updated user</returns>
    Task<User> UpdateAsync(User user);
    
    /// <summary>
    /// Deletes a user by their identifier
    /// </summary>
    /// <param name="id">The user identifier</param>
    /// <returns>A task representing the asynchronous operation</returns>
    Task DeleteAsync(Guid id);
    
    /// <summary>
    /// Checks if a user exists by their identifier
    /// </summary>
    /// <param name="id">The user identifier</param>
    /// <returns>True if the user exists; otherwise, false</returns>
    Task<bool> ExistsAsync(Guid id);
    
    /// <summary>
    /// Checks if an email address is already in use
    /// </summary>
    /// <param name="email">The email address to check</param>
    /// <returns>True if the email exists; otherwise, false</returns>
    Task<bool> EmailExistsAsync(string email);
    
    /// <summary>
    /// Checks if a phone number is already in use
    /// </summary>
    /// <param name="phoneNumber">The phone number to check</param>
    /// <returns>True if the phone number exists; otherwise, false</returns>
    Task<bool> PhoneNumberExistsAsync(string phoneNumber);
}
