using FluentAssertions;
using Volcanion.Auth.Domain.ValueObjects;

namespace Volcanion.Auth.Domain.Tests.ValueObjects;

public class EmailTests
{
    [Fact]
    public void Create_WithNullOrEmptyEmail_ShouldThrowArgumentException()
    {
        // Act & Assert
        Action actNull = () => Email.Create(null!);
        Action actEmpty = () => Email.Create("");
        Action actWhitespace = () => Email.Create("   ");

        actNull.Should().Throw<ArgumentException>().WithMessage("Email cannot be empty");
        actEmpty.Should().Throw<ArgumentException>().WithMessage("Email cannot be empty");
        actWhitespace.Should().Throw<ArgumentException>().WithMessage("Email cannot be empty");
    }

    [Theory]
    [InlineData("user@domain.com")]
    [InlineData("test.email@example.org")]
    [InlineData("user+tag@domain.co.uk")]
    [InlineData("firstname.lastname@company.com")]
    [InlineData("user_name@domain-name.com")]
    [InlineData("123@domain.com")]
    public void Create_WithValidEmail_ShouldReturnEmailInstance(string validEmail)
    {
        // Act
        var result = Email.Create(validEmail);

        // Assert
        result.Should().NotBeNull();
        result.Value.Should().Be(validEmail.ToLowerInvariant());
    }

    [Theory]
    [InlineData("plainaddress")]          // Missing @
    [InlineData("@missinglocal.com")]     // Missing local part
    [InlineData("missing.domain@")]       // Missing domain
    [InlineData("user@")]                 // Missing domain
    [InlineData("user@@domain.com")]      // Double @
    [InlineData("user@domain")]           // Missing TLD
    [InlineData("user@domain.")]          // TLD too short
    [InlineData("user@domain.c")]         // TLD too short
    [InlineData("user name@domain.com")]  // Space in local part
    public void Create_WithInvalidEmail_ShouldThrowArgumentException(string invalidEmail)
    {
        // Act & Assert
        Action act = () => Email.Create(invalidEmail);
        act.Should().Throw<ArgumentException>().WithMessage("Invalid email format");
    }

    [Theory]
    [InlineData("User@Domain.COM", "user@domain.com")]
    [InlineData("TEST.EMAIL@EXAMPLE.ORG", "test.email@example.org")]
    [InlineData("   user@domain.com   ", "user@domain.com")]
    public void Create_WithMixedCaseAndWhitespace_ShouldNormalizeToLowerCase(string inputEmail, string expectedEmail)
    {
        // Act
        var result = Email.Create(inputEmail);

        // Assert
        result.Value.Should().Be(expectedEmail);
    }

    [Fact]
    public void Create_WithValidBusinessEmails_ShouldCreateSuccessfully()
    {
        // Arrange
        var businessEmails = new[]
        {
            "admin@company.com",
            "sales@business.org",
            "support@service.net",
            "info@organization.gov"
        };

        foreach (var email in businessEmails)
        {
            // Act
            var result = Email.Create(email);

            // Assert
            result.Should().NotBeNull();
            result.Value.Should().Be(email.ToLowerInvariant());
        }
    }

    [Fact]
    public void ToString_ShouldReturnEmailValue()
    {
        // Arrange
        var email = Email.Create("user@domain.com");

        // Act
        var result = email.ToString();

        // Assert
        result.Should().Be("user@domain.com");
    }

    [Fact]
    public void ImplicitConversion_ToString_ShouldWork()
    {
        // Arrange
        var email = Email.Create("user@domain.com");

        // Act
        string result = email;

        // Assert
        result.Should().Be("user@domain.com");
    }

    [Fact]
    public void Equals_WithSameEmailValue_ShouldReturnTrue()
    {
        // Arrange
        var email1 = Email.Create("User@Domain.COM");
        var email2 = Email.Create("user@domain.com");

        // Act & Assert
        email1.Value.Should().Be(email2.Value);
    }

    [Theory]
    [InlineData("test@gmail.com")]
    [InlineData("user@yahoo.com")]
    [InlineData("contact@outlook.com")]
    [InlineData("info@hotmail.com")]
    public void Create_WithPopularEmailProviders_ShouldCreateSuccessfully(string email)
    {
        // Act
        var result = Email.Create(email);

        // Assert
        result.Should().NotBeNull();
        result.Value.Should().Be(email);
    }
}
