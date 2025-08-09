using FluentAssertions;
using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.Validators;

namespace Volcanion.Auth.Application.Tests.Validators;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator;

    public RegisterRequestValidatorTests()
    {
        _validator = new RegisterRequestValidator();
    }

    [Fact]
    public void Validate_WithValidRequest_ShouldBeValid()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            PhoneNumber = "0986123456",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = "John",
            LastName = "Doe",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    [InlineData("invalid-email")]
    [InlineData("@domain.com")]
    [InlineData("user@")]
    [InlineData("user.domain.com")]
    public void Validate_WithInvalidEmail_ShouldBeInvalid(string email)
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = email,
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = "John",
            LastName = "Doe",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(RegisterRequestDto.Email));
    }

    [Theory]
    [InlineData("")]
    [InlineData("weak")]
    [InlineData("password")]
    [InlineData("PASSWORD")]
    [InlineData("12345678")]
    [InlineData("Password")]
    [InlineData("Password123")]
    public void Validate_WithWeakPassword_ShouldBeInvalid(string password)
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = password,
            ConfirmPassword = password,
            FirstName = "John",
            LastName = "Doe",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(RegisterRequestDto.Password));
    }

    [Fact]
    public void Validate_WithPasswordMismatch_ShouldBeInvalid()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "DifferentPassword123!",
            FirstName = "John",
            LastName = "Doe",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(RegisterRequestDto.ConfirmPassword));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_WithEmptyFirstName_ShouldBeInvalid(string firstName)
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = firstName,
            LastName = "Doe",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(RegisterRequestDto.FirstName));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_WithEmptyLastName_ShouldBeInvalid(string lastName)
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = "John",
            LastName = lastName,
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(RegisterRequestDto.LastName));
    }

    [Theory]
    [InlineData("0986123456")]  // Valid Viettel
    [InlineData("0567890123")]  // Valid Mobifone
    [InlineData("0789012345")]  // Valid Vinaphone
    [InlineData(null)]          // Null is valid (optional)
    [InlineData("")]            // Empty is valid (optional)
    public void Validate_WithValidPhoneNumber_ShouldBeValid(string phoneNumber)
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            PhoneNumber = phoneNumber,
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = "John",
            LastName = "Doe",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("0123456789")]   // Invalid prefix
    [InlineData("123456789")]    // Too short
    [InlineData("01234567890")]  // Too long
    [InlineData("invalid")]      // Not a number
    public void Validate_WithInvalidPhoneNumber_ShouldBeInvalid(string phoneNumber)
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            PhoneNumber = phoneNumber,
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = "John",
            LastName = "Doe",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(RegisterRequestDto.PhoneNumber));
    }

    [Fact]
    public void Validate_WithTooLongFirstName_ShouldBeInvalid()
    {
        // Arrange
        var longName = new string('a', 101); // 101 characters
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = longName,
            LastName = "Doe",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(RegisterRequestDto.FirstName));
    }

    [Fact]
    public void Validate_WithTooLongLastName_ShouldBeInvalid()
    {
        // Arrange
        var longName = new string('a', 101); // 101 characters
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = "John",
            LastName = longName,
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(RegisterRequestDto.LastName));
    }

    [Theory]
    [InlineData("StrongP@ssw0rd")]
    [InlineData("MySecure123!")]
    [InlineData("TestPass1@")]  // @ is in the allowed special characters
    public void Validate_WithStrongPassword_ShouldBeValid(string password)
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Password = password,
            ConfirmPassword = password,
            FirstName = "John",
            LastName = "Doe",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
    }
}
