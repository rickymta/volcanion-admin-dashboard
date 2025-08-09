namespace Volcanion.Auth.Application.DTOs.Auth;

/// <summary>
/// Data transfer object for user login requests
/// </summary>
public class LoginRequestDto
{
    /// <summary>
    /// Gets or sets the email address or phone number for authentication
    /// </summary>
    public string EmailOrPhone { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's password
    /// </summary>
    public string Password { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the device identifier for multi-device authentication
    /// </summary>
    public string DeviceId { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the device name for user-friendly display (optional)
    /// </summary>
    public string? DeviceName { get; set; }
    
    /// <summary>
    /// Gets or sets a value indicating whether to extend the session duration
    /// </summary>
    public bool RememberMe { get; set; }
}

/// <summary>
/// Data transfer object for user registration requests
/// </summary>
public class RegisterRequestDto
{
    /// <summary>
    /// Gets or sets the user's email address
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's phone number (optional, must be Vietnamese format)
    /// </summary>
    public string? PhoneNumber { get; set; }
    
    /// <summary>
    /// Gets or sets the user's password
    /// </summary>
    public string Password { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the password confirmation
    /// </summary>
    public string ConfirmPassword { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the user's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the device identifier for multi-device authentication
    /// </summary>
    public string DeviceId { get; set; } = string.Empty;
    
    /// <summary>
    /// Gets or sets the device name for user-friendly display (optional)
    /// </summary>
    public string? DeviceName { get; set; }
}

/// <summary>
/// Data transfer object for refresh token requests
/// </summary>
public class RefreshTokenRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
    public string DeviceId { get; set; } = string.Empty;
}

public class LogoutRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
    public string DeviceId { get; set; } = string.Empty;
}

public class LogoutAllRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}
