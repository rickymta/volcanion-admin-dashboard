using FluentAssertions;
using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.Validators;

namespace Volcanion.Auth.Application.Tests.Validators;

public class LoginRequestValidatorTests
{
    private readonly LoginRequestValidator _validator;

    public LoginRequestValidatorTests()
    {
        _validator = new LoginRequestValidator();
    }

    [Fact]
    public void Validate_WithValidRequest_ShouldBeValid()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            EmailOrPhone = "test@example.com",
            Password = "Password123!",
            DeviceId = "device123",
            RememberMe = false
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
    public void Validate_WithEmptyEmailOrPhone_ShouldBeInvalid(string emailOrPhone)
    {
        // Arrange
        var request = new LoginRequestDto
        {
            EmailOrPhone = emailOrPhone,
            Password = "Password123!",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(LoginRequestDto.EmailOrPhone));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_WithEmptyPassword_ShouldBeInvalid(string password)
    {
        // Arrange
        var request = new LoginRequestDto
        {
            EmailOrPhone = "test@example.com",
            Password = password,
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(LoginRequestDto.Password));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_WithEmptyDeviceId_ShouldBeInvalid(string deviceId)
    {
        // Arrange
        var request = new LoginRequestDto
        {
            EmailOrPhone = "test@example.com",
            Password = "Password123!",
            DeviceId = deviceId
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == nameof(LoginRequestDto.DeviceId));
    }

    [Fact]
    public void Validate_WithPhoneNumber_ShouldBeValid()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            EmailOrPhone = "0986123456",
            Password = "Password123!",
            DeviceId = "device123"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithAllFieldsEmpty_ShouldHaveMultipleErrors()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            EmailOrPhone = "",
            Password = "",
            DeviceId = ""
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().HaveCount(3);
    }
}
