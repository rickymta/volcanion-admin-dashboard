using System.Text.RegularExpressions;

namespace Volcanion.Auth.Domain.ValueObjects;

/// <summary>
/// Represents an email address value object with validation
/// </summary>
public class Email
{
    /// <summary>
    /// Regular expression pattern for email validation
    /// </summary>
    private const string EmailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
    
    /// <summary>
    /// Gets the email address value
    /// </summary>
    public string Value { get; private set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="Email"/> class
    /// </summary>
    /// <param name="value">The email address value</param>
    private Email(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new email instance with validation
    /// </summary>
    /// <param name="email">The email address to validate and create</param>
    /// <returns>A validated Email instance</returns>
    /// <exception cref="ArgumentException">Thrown when email is null, empty, or invalid format</exception>
    public static Email Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty");

        var normalizedEmail = email.ToLowerInvariant().Trim();
        
        if (!IsValidEmail(normalizedEmail))
            throw new ArgumentException("Invalid email format");

        return new Email(normalizedEmail);
    }

    /// <summary>
    /// Validates if the given email has a valid format
    /// </summary>
    /// <param name="email">The email address to validate</param>
    /// <returns>True if the email format is valid; otherwise, false</returns>
    private static bool IsValidEmail(string email)
    {
        return Regex.IsMatch(email, EmailPattern);
    }

    public override string ToString() => Value;

    public static implicit operator string(Email email) => email.Value;
}
