using AutoFixture;
using FluentAssertions;
using Volcanion.Auth.Infrastructure.Services;
using Xunit;

namespace Volcanion.Auth.Infrastructure.Tests.Services;

/// <summary>
/// Unit tests for PasswordService
/// </summary>
public class PasswordServiceTests
{
    private readonly PasswordService _passwordService;
    private readonly Fixture _fixture;

    public PasswordServiceTests()
    {
        _passwordService = new PasswordService();
        _fixture = new Fixture();
    }

    [Fact]
    public void HashPassword_WithValidPassword_ShouldReturnHashedPassword()
    {
        // Arrange
        var password = "ValidPassword123!";

        // Act
        var hashedPassword = _passwordService.HashPassword(password);

        // Assert
        hashedPassword.Should().NotBeNullOrEmpty();
        hashedPassword.Should().NotBe(password);
        hashedPassword.Length.Should().BeGreaterThan(50); // Base64 encoded hash should be longer
    }

    [Fact]
    public void VerifyPassword_WithCorrectPassword_ShouldReturnTrue()
    {
        // Arrange
        var password = "ValidPassword123!";
        var hashedPassword = _passwordService.HashPassword(password);

        // Act
        var result = _passwordService.VerifyPassword(password, hashedPassword);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_WithIncorrectPassword_ShouldReturnFalse()
    {
        // Arrange
        var correctPassword = "ValidPassword123!";
        var incorrectPassword = "WrongPassword456!";
        var hashedPassword = _passwordService.HashPassword(correctPassword);

        // Act
        var result = _passwordService.VerifyPassword(incorrectPassword, hashedPassword);

        // Assert
        result.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void HashPassword_WithEmptyOrWhitespacePassword_ShouldReturnValidHash(string password)
    {
        // Act
        var result = _passwordService.HashPassword(password);

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().NotBe(password); // Should be different from input
    }

    [Fact]
    public void HashPassword_WithNullPassword_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => _passwordService.HashPassword(null!);
        action.Should().Throw<ArgumentNullException>();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void VerifyPassword_WithNullOrEmptyHash_ShouldReturnFalse(string? hash)
    {
        // Arrange
        var password = "ValidPassword123!";

        // Act
        var result = _passwordService.VerifyPassword(password, hash!);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void PasswordSecurity_WithHashedPassword_ShouldNotContainOriginalPassword()
    {
        // Arrange
        var password = "SecretPassword123!";

        // Act
        var hashedPassword = _passwordService.HashPassword(password);

        // Assert
        hashedPassword.Should().NotContain(password);
        hashedPassword.Should().NotContain("SecretPassword");
        hashedPassword.Should().NotContain("123!");
    }

    [Fact]
    public void HashPassword_PerformanceTest_ShouldCompleteInReasonableTime()
    {
        // Arrange
        var password = "PerformanceTestPassword123!";
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        // Act
        var hashedPassword = _passwordService.HashPassword(password);
        stopwatch.Stop();

        // Assert
        hashedPassword.Should().NotBeNullOrEmpty();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(5000); // Should complete within 5 seconds
    }

    [Theory]
    [InlineData("Password123!")]
    [InlineData("MySecurePass1!")]
    [InlineData("StrongPassword2023@")]
    public void IsValidPassword_WithValidPassword_ShouldReturnTrue(string validPassword)
    {
        // Act
        var result = _passwordService.IsValidPassword(validPassword);

        // Assert
        result.Should().BeTrue();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("password")]        // No uppercase, no numbers, no special chars
    [InlineData("PASSWORD")]        // No lowercase, no numbers, no special chars
    [InlineData("Password")]        // No numbers, no special chars
    [InlineData("Password!")]       // No numbers
    [InlineData("Password123")]     // No special chars
    [InlineData("Pass1!")]          // Too short
    [InlineData("1234!")]           // No letters
    [InlineData("password123")]     // No uppercase, no special chars
    public void IsValidPassword_WithInvalidPassword_ShouldReturnFalse(string? invalidPassword)
    {
        // Act
        var result = _passwordService.IsValidPassword(invalidPassword ?? string.Empty);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void HashPassword_WithSamePasswordMultipleTimes_ShouldProduceDifferentHashes()
    {
        // Arrange
        var password = "SamePassword123!";

        // Act
        var hash1 = _passwordService.HashPassword(password);
        var hash2 = _passwordService.HashPassword(password);
        var hash3 = _passwordService.HashPassword(password);

        // Assert
        hash1.Should().NotBe(hash2);
        hash2.Should().NotBe(hash3);
        hash1.Should().NotBe(hash3);

        // But all should verify correctly
        _passwordService.VerifyPassword(password, hash1).Should().BeTrue();
        _passwordService.VerifyPassword(password, hash2).Should().BeTrue();
        _passwordService.VerifyPassword(password, hash3).Should().BeTrue();
    }
}
