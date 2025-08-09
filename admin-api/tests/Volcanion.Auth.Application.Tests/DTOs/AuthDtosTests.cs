using FluentAssertions;
using Volcanion.Auth.Application.DTOs.Auth;

namespace Volcanion.Auth.Application.Tests.DTOs;

public class AuthDtosTests
{
    [Fact]
    public void LoginRequestDto_ShouldHaveCorrectDefaultValues()
    {
        // Act
        var dto = new LoginRequestDto();

        // Assert
        dto.EmailOrPhone.Should().Be(string.Empty);
        dto.Password.Should().Be(string.Empty);
        dto.DeviceId.Should().Be(string.Empty);
        dto.DeviceName.Should().BeNull();
        dto.RememberMe.Should().BeFalse();
    }

    [Fact]
    public void LoginRequestDto_ShouldSetPropertiesCorrectly()
    {
        // Arrange & Act
        var dto = new LoginRequestDto
        {
            EmailOrPhone = "test@example.com",
            Password = "password123",
            DeviceId = "device-123",
            DeviceName = "iPhone 15",
            RememberMe = true
        };

        // Assert
        dto.EmailOrPhone.Should().Be("test@example.com");
        dto.Password.Should().Be("password123");
        dto.DeviceId.Should().Be("device-123");
        dto.DeviceName.Should().Be("iPhone 15");
        dto.RememberMe.Should().BeTrue();
    }

    [Fact]
    public void RegisterRequestDto_ShouldHaveCorrectDefaultValues()
    {
        // Act
        var dto = new RegisterRequestDto();

        // Assert
        dto.Email.Should().Be(string.Empty);
        dto.PhoneNumber.Should().BeNull();
        dto.Password.Should().Be(string.Empty);
        dto.ConfirmPassword.Should().Be(string.Empty);
        dto.FirstName.Should().Be(string.Empty);
        dto.LastName.Should().Be(string.Empty);
        dto.DeviceId.Should().Be(string.Empty);
        dto.DeviceName.Should().BeNull();
    }

    [Fact]
    public void RegisterRequestDto_ShouldSetPropertiesCorrectly()
    {
        // Arrange & Act
        var dto = new RegisterRequestDto
        {
            Email = "test@example.com",
            PhoneNumber = "0986123456",
            Password = "password123",
            ConfirmPassword = "password123",
            FirstName = "John",
            LastName = "Doe",
            DeviceId = "device-123",
            DeviceName = "iPhone 15"
        };

        // Assert
        dto.Email.Should().Be("test@example.com");
        dto.PhoneNumber.Should().Be("0986123456");
        dto.Password.Should().Be("password123");
        dto.ConfirmPassword.Should().Be("password123");
        dto.FirstName.Should().Be("John");
        dto.LastName.Should().Be("Doe");
        dto.DeviceId.Should().Be("device-123");
        dto.DeviceName.Should().Be("iPhone 15");
    }

    [Fact]
    public void AuthResponseDto_ShouldHaveCorrectDefaultValues()
    {
        // Act
        var dto = new AuthResponseDto();

        // Assert
        dto.AccessToken.Should().Be(string.Empty);
        dto.RefreshToken.Should().Be(string.Empty);
        dto.ExpiresAt.Should().Be(default(DateTime));
        dto.User.Should().BeNull(); // User is not initialized by default
    }

    [Fact]
    public void AuthResponseDto_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var expiresAt = DateTime.UtcNow.AddHours(1);
        var userDto = new UserDto
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var dto = new AuthResponseDto
        {
            AccessToken = "access-token-123",
            RefreshToken = "refresh-token-456",
            ExpiresAt = expiresAt,
            User = userDto
        };

        // Assert
        dto.AccessToken.Should().Be("access-token-123");
        dto.RefreshToken.Should().Be("refresh-token-456");
        dto.ExpiresAt.Should().Be(expiresAt);
        dto.User.Should().Be(userDto);
    }

    [Fact]
    public void UserDto_ShouldHaveCorrectDefaultValues()
    {
        // Act
        var dto = new UserDto();

        // Assert
        dto.Id.Should().Be(Guid.Empty);
        dto.Email.Should().Be(string.Empty);
        dto.PhoneNumber.Should().BeNull();
        dto.FirstName.Should().Be(string.Empty);
        dto.LastName.Should().Be(string.Empty);
        dto.FullName.Should().Be(string.Empty);
        dto.Avatar.Should().BeNull();
        dto.IsEmailVerified.Should().BeFalse();
        dto.IsPhoneVerified.Should().BeFalse();
        dto.CreatedAt.Should().Be(default(DateTime));
        dto.LastLoginAt.Should().BeNull();
        dto.Roles.Should().NotBeNull().And.BeEmpty();
        dto.Permissions.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void UserDto_FullName_ShouldCombineFirstAndLastName()
    {
        // Arrange & Act
        var dto = new UserDto
        {
            FirstName = "John",
            LastName = "Doe"
        };

        // Assert
        dto.FullName.Should().Be("John Doe");
    }

    [Fact]
    public void UserDto_FullName_ShouldHandleEmptyNames()
    {
        // Test with only first name
        var dto1 = new UserDto { FirstName = "John", LastName = "" };
        dto1.FullName.Should().Be("John");

        // Test with only last name
        var dto2 = new UserDto { FirstName = "", LastName = "Doe" };
        dto2.FullName.Should().Be("Doe");

        // Test with both empty
        var dto3 = new UserDto { FirstName = "", LastName = "" };
        dto3.FullName.Should().Be(string.Empty);
    }

    [Fact]
    public void UserDto_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var lastLoginAt = DateTime.UtcNow.AddMinutes(-30);
        var roles = new List<string> { "Admin", "User" };
        var permissions = new List<string> { "Read", "Write", "Delete" };

        // Act
        var dto = new UserDto
        {
            Id = userId,
            Email = "john.doe@example.com",
            PhoneNumber = "0986123456",
            FirstName = "John",
            LastName = "Doe",
            Avatar = "https://example.com/avatar.jpg",
            IsEmailVerified = true,
            IsPhoneVerified = true,
            CreatedAt = createdAt,
            LastLoginAt = lastLoginAt,
            Roles = roles,
            Permissions = permissions
        };

        // Assert
        dto.Id.Should().Be(userId);
        dto.Email.Should().Be("john.doe@example.com");
        dto.PhoneNumber.Should().Be("0986123456");
        dto.FirstName.Should().Be("John");
        dto.LastName.Should().Be("Doe");
        dto.FullName.Should().Be("John Doe");
        dto.Avatar.Should().Be("https://example.com/avatar.jpg");
        dto.IsEmailVerified.Should().BeTrue();
        dto.IsPhoneVerified.Should().BeTrue();
        dto.CreatedAt.Should().Be(createdAt);
        dto.LastLoginAt.Should().Be(lastLoginAt);
        dto.Roles.Should().BeEquivalentTo(roles);
        dto.Permissions.Should().BeEquivalentTo(permissions);
    }

    [Fact]
    public void RefreshTokenResponseDto_ShouldHaveCorrectDefaultValues()
    {
        // Act
        var dto = new RefreshTokenResponseDto();

        // Assert
        dto.AccessToken.Should().Be(string.Empty);
        dto.RefreshToken.Should().Be(string.Empty);
        dto.ExpiresAt.Should().Be(default(DateTime));
    }

    [Fact]
    public void RefreshTokenResponseDto_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var expiresAt = DateTime.UtcNow.AddHours(1);

        // Act
        var dto = new RefreshTokenResponseDto
        {
            AccessToken = "new-access-token",
            RefreshToken = "new-refresh-token",
            ExpiresAt = expiresAt
        };

        // Assert
        dto.AccessToken.Should().Be("new-access-token");
        dto.RefreshToken.Should().Be("new-refresh-token");
        dto.ExpiresAt.Should().Be(expiresAt);
    }
}
