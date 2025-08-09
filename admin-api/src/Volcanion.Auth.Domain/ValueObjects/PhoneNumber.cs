using System.Text.RegularExpressions;

namespace Volcanion.Auth.Domain.ValueObjects;

/// <summary>
/// Represents a Vietnamese phone number value object with validation
/// </summary>
public class PhoneNumber
{
    /// <summary>
    /// Regular expression pattern for Vietnamese phone number validation
    /// Supports mobile networks: Viettel, Vinaphone, Mobifone, Vietnamobile, Gmobile
    /// </summary>
    private const string VietnamPhonePattern = @"^(\+84|84|0)(3[2-9]|5[2689]|7[06-9]|8[1-6]|9[0-46-9])[0-9]{7}$";
    
    /// <summary>
    /// Gets the phone number value
    /// </summary>
    public string Value { get; private set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="PhoneNumber"/> class
    /// </summary>
    /// <param name="value">The phone number value</param>
    private PhoneNumber(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new phone number instance with validation for Vietnamese phone numbers
    /// </summary>
    /// <param name="phoneNumber">The phone number to validate and create</param>
    /// <returns>A validated PhoneNumber instance</returns>
    /// <exception cref="ArgumentException">Thrown when phone number is null, empty, or invalid format</exception>
    public static PhoneNumber Create(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            throw new ArgumentException("Phone number cannot be empty");

        var normalizedPhone = NormalizePhoneNumber(phoneNumber);
        
        if (!IsValidVietnamesePhoneNumber(normalizedPhone))
            throw new ArgumentException("Invalid Vietnamese phone number format");

        return new PhoneNumber(normalizedPhone);
    }

    /// <summary>
    /// Normalizes the phone number by removing spaces, dashes, and standardizing the format
    /// </summary>
    /// <param name="phoneNumber">The phone number to normalize</param>
    /// <returns>The normalized phone number</returns>
    private static string NormalizePhoneNumber(string phoneNumber)
    {
        // Remove spaces, dashes, and parentheses
        var cleaned = phoneNumber.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");
        
        // Convert to +84 format
        if (cleaned.StartsWith("0"))
            cleaned = "+84" + cleaned.Substring(1);
        else if (cleaned.StartsWith("84"))
            cleaned = "+" + cleaned;
        else if (!cleaned.StartsWith("+84"))
            cleaned = "+84" + cleaned;

        return cleaned;
    }

    private static bool IsValidVietnamesePhoneNumber(string phoneNumber)
    {
        return Regex.IsMatch(phoneNumber, VietnamPhonePattern);
    }

    public override string ToString() => Value;

    public static implicit operator string(PhoneNumber phoneNumber) => phoneNumber.Value;
}
