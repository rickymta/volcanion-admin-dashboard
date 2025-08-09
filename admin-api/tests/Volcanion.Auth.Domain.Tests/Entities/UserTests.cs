using FluentAssertions;
using Volcanion.Auth.Domain.Entities;
using Xunit;

namespace Volcanion.Auth.Domain.Tests.Entities;

/// <summary>
/// Unit tests for User entity
/// </summary>
public class UserTests
{
    [Fact]
    public void User_Creation_ShouldSetDefaultValues()
    {
        // Act
        var user = new User();

        // Assert
        user.Id.Should().Be(Guid.Empty);
        user.Email.Should().Be(string.Empty);
        user.PhoneNumber.Should().BeNull();
        user.PasswordHash.Should().Be(string.Empty);
        user.FirstName.Should().Be(string.Empty);
        user.LastName.Should().Be(string.Empty);
        user.Avatar.Should().BeNull();
        user.IsEmailVerified.Should().BeFalse();
        user.IsPhoneVerified.Should().BeFalse();
        user.IsActive.Should().BeTrue(); // Default to active
        user.CreatedAt.Should().Be(DateTime.MinValue);
        user.UpdatedAt.Should().Be(DateTime.MinValue);
        user.LastLoginAt.Should().BeNull();
        user.UserRoles.Should().NotBeNull().And.BeEmpty();
        user.RefreshTokens.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void User_SetProperties_ShouldWorkCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        // Act
        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            PhoneNumber = "+84123456789",
            PasswordHash = "hashedpassword123",
            FirstName = "John",
            LastName = "Doe",
            Avatar = "https://example.com/avatar.jpg",
            IsEmailVerified = true,
            IsPhoneVerified = true,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
            LastLoginAt = now.AddHours(-1)
        };

        // Assert
        user.Id.Should().Be(userId);
        user.Email.Should().Be("test@example.com");
        user.PhoneNumber.Should().Be("+84123456789");
        user.PasswordHash.Should().Be("hashedpassword123");
        user.FirstName.Should().Be("John");
        user.LastName.Should().Be("Doe");
        user.Avatar.Should().Be("https://example.com/avatar.jpg");
        user.IsEmailVerified.Should().BeTrue();
        user.IsPhoneVerified.Should().BeTrue();
        user.IsActive.Should().BeTrue();
        user.CreatedAt.Should().Be(now);
        user.UpdatedAt.Should().Be(now);
        user.LastLoginAt.Should().Be(now.AddHours(-1));
    }

    [Fact]
    public void User_UserRoles_ShouldBeInitializedAsEmptyCollection()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        user.UserRoles.Should().NotBeNull();
        user.UserRoles.Should().BeEmpty();
        user.UserRoles.Should().BeAssignableTo<ICollection<UserRole>>();
    }

    [Fact]
    public void User_RefreshTokens_ShouldBeInitializedAsEmptyCollection()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        user.RefreshTokens.Should().NotBeNull();
        user.RefreshTokens.Should().BeEmpty();
        user.RefreshTokens.Should().BeAssignableTo<ICollection<RefreshToken>>();
    }

    [Fact]
    public void User_UserRoles_CanAddAndRemoveRoles()
    {
        // Arrange
        var user = new User();
        var userRole = new UserRole
        {
            UserId = user.Id,
            RoleId = Guid.NewGuid(),
            User = user
        };

        // Act
        user.UserRoles.Add(userRole);

        // Assert
        user.UserRoles.Should().HaveCount(1);
        user.UserRoles.Should().Contain(userRole);

        // Act - Remove
        user.UserRoles.Remove(userRole);

        // Assert
        user.UserRoles.Should().BeEmpty();
    }

    [Fact]
    public void User_RefreshTokens_CanAddAndRemoveTokens()
    {
        // Arrange
        var user = new User { Id = Guid.NewGuid() };
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "refresh-token-123",
            DeviceId = "device-123",
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow,
            User = user
        };

        // Act
        user.RefreshTokens.Add(refreshToken);

        // Assert
        user.RefreshTokens.Should().HaveCount(1);
        user.RefreshTokens.Should().Contain(refreshToken);

        // Act - Remove
        user.RefreshTokens.Remove(refreshToken);

        // Assert
        user.RefreshTokens.Should().BeEmpty();
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void User_IsActive_ShouldSetCorrectly(bool isActive)
    {
        // Arrange & Act
        var user = new User { IsActive = isActive };

        // Assert
        user.IsActive.Should().Be(isActive);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void User_IsEmailVerified_ShouldSetCorrectly(bool isVerified)
    {
        // Arrange & Act
        var user = new User { IsEmailVerified = isVerified };

        // Assert
        user.IsEmailVerified.Should().Be(isVerified);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void User_IsPhoneVerified_ShouldSetCorrectly(bool isVerified)
    {
        // Arrange & Act
        var user = new User { IsPhoneVerified = isVerified };

        // Assert
        user.IsPhoneVerified.Should().Be(isVerified);
    }

    [Fact]
    public void User_OptionalFields_CanBeNull()
    {
        // Arrange & Act
        var user = new User
        {
            PhoneNumber = null,
            Avatar = null,
            LastLoginAt = null
        };

        // Assert
        user.PhoneNumber.Should().BeNull();
        user.Avatar.Should().BeNull();
        user.LastLoginAt.Should().BeNull();
    }

    [Fact]
    public void User_DateTimeFields_ShouldAcceptUtcDateTime()
    {
        // Arrange
        var utcNow = DateTime.UtcNow;
        var utcCreated = DateTime.UtcNow.AddDays(-10);

        // Act
        var user = new User
        {
            CreatedAt = utcCreated,
            UpdatedAt = utcNow,
            LastLoginAt = utcNow.AddHours(-2)
        };

        // Assert
        user.CreatedAt.Should().Be(utcCreated);
        user.UpdatedAt.Should().Be(utcNow);
        user.LastLoginAt.Should().Be(utcNow.AddHours(-2));
    }
}
