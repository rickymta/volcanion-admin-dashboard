namespace Volcanion.Auth.Application.Interfaces;

/// <summary>
/// Service interface for password hashing and verification operations
/// </summary>
public interface IPasswordService
{
    /// <summary>
    /// Hashes a password using a secure hashing algorithm
    /// </summary>
    /// <param name="password">The plain text password to hash</param>
    /// <returns>The hashed password</returns>
    string HashPassword(string password);
    
    /// <summary>
    /// Verifies if a plain text password matches the hashed password
    /// </summary>
    /// <param name="password">The plain text password</param>
    /// <param name="hash">The hashed password to compare against</param>
    /// <returns>True if the password matches; otherwise, false</returns>
    bool VerifyPassword(string password, string hash);
    
    /// <summary>
    /// Validates if a password meets the security requirements
    /// </summary>
    /// <param name="password">The password to validate</param>
    /// <returns>True if the password is valid; otherwise, false</returns>
    bool IsValidPassword(string password);
}
