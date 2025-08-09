using AutoFixture;
using AutoMapper;
using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Moq;
using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.Interfaces;
using Volcanion.Auth.Application.Services;
using Volcanion.Auth.Domain.Entities;
using Volcanion.Auth.Domain.Interfaces;

namespace Volcanion.Auth.Application.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IRoleRepository> _roleRepositoryMock;
    private readonly Mock<IRefreshTokenRepository> _refreshTokenRepositoryMock;
    private readonly Mock<ICacheService> _cacheServiceMock;
    private readonly Mock<IPasswordService> _passwordServiceMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<IValidator<LoginRequestDto>> _loginValidatorMock;
    private readonly Mock<IValidator<RegisterRequestDto>> _registerValidatorMock;
    private readonly AuthService _authService;
    private readonly Fixture _fixture;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _roleRepositoryMock = new Mock<IRoleRepository>();
        _refreshTokenRepositoryMock = new Mock<IRefreshTokenRepository>();
        _cacheServiceMock = new Mock<ICacheService>();
        _passwordServiceMock = new Mock<IPasswordService>();
        _tokenServiceMock = new Mock<ITokenService>();
        _mapperMock = new Mock<IMapper>();
        _loginValidatorMock = new Mock<IValidator<LoginRequestDto>>();
        _registerValidatorMock = new Mock<IValidator<RegisterRequestDto>>();
        _fixture = new Fixture();

        _authService = new AuthService(
            _userRepositoryMock.Object,
            _roleRepositoryMock.Object,
            _refreshTokenRepositoryMock.Object,
            _cacheServiceMock.Object,
            _passwordServiceMock.Object,
            _tokenServiceMock.Object,
            _mapperMock.Object,
            _loginValidatorMock.Object,
            _registerValidatorMock.Object);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnAuthResponse()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            EmailOrPhone = "test@example.com",
            Password = "Password123!",
            DeviceId = "device123",
            RememberMe = false
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "0986123456",
            PasswordHash = "hashed_password",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var validationResult = new ValidationResult();
        var authResponse = new AuthResponseDto
        {
            AccessToken = "access_token",
            RefreshToken = "refresh_token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            }
        };

        _loginValidatorMock.Setup(x => x.ValidateAsync(loginRequest, default))
            .ReturnsAsync(validationResult);

        _userRepositoryMock.Setup(x => x.GetByEmailOrPhoneAsync(loginRequest.EmailOrPhone))
            .ReturnsAsync(user);

        _passwordServiceMock.Setup(x => x.VerifyPassword(loginRequest.Password, user.PasswordHash))
            .Returns(true);

        _tokenServiceMock.Setup(x => x.GenerateAccessToken(user.Id, user.Email, It.IsAny<IEnumerable<string>>(), It.IsAny<IEnumerable<string>>()))
            .Returns("access_token");

        _tokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");

        _mapperMock.Setup(x => x.Map<AuthResponseDto>(It.IsAny<object>()))
            .Returns(authResponse);

        // Act
        var result = await _authService.LoginAsync(loginRequest);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("access_token");
        result.RefreshToken.Should().Be("refresh_token");
        result.User.Should().NotBeNull();
    }

    [Fact]
    public async Task LoginAsync_WithInvalidCredentials_ShouldThrowValidationException()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            EmailOrPhone = "invalid-email",
            Password = "weak",
            DeviceId = "device123"
        };

        var validationFailures = new List<ValidationFailure>
        {
            new("EmailOrPhone", "Invalid email format"),
            new("Password", "Password too weak")
        };
        var validationResult = new ValidationResult(validationFailures);

        _loginValidatorMock.Setup(x => x.ValidateAsync(loginRequest, default))
            .ReturnsAsync(validationResult);

        // Act & Assert
        var act = async () => await _authService.LoginAsync(loginRequest);
        await act.Should().ThrowAsync<Application.Exceptions.ValidationException>();
    }

    [Fact]
    public async Task LoginAsync_WithNonExistentUser_ShouldThrowNotFoundException()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            EmailOrPhone = "nonexistent@example.com",
            Password = "Password123!",
            DeviceId = "device123"
        };

        var validationResult = new ValidationResult();

        _loginValidatorMock.Setup(x => x.ValidateAsync(loginRequest, default))
            .ReturnsAsync(validationResult);

        _userRepositoryMock.Setup(x => x.GetByEmailOrPhoneAsync(loginRequest.EmailOrPhone))
            .ReturnsAsync((User?)null);

        // Act & Assert
        var act = async () => await _authService.LoginAsync(loginRequest);
        await act.Should().ThrowAsync<Application.Exceptions.NotFoundException>();
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ShouldThrowUnauthorizedException()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            EmailOrPhone = "test@example.com",
            Password = "WrongPassword",
            DeviceId = "device123"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "0986123456",
            PasswordHash = "correct_hashed_password",
            IsActive = true
        };

        var validationResult = new ValidationResult();

        _loginValidatorMock.Setup(x => x.ValidateAsync(loginRequest, default))
            .ReturnsAsync(validationResult);

        _userRepositoryMock.Setup(x => x.GetByEmailOrPhoneAsync(loginRequest.EmailOrPhone))
            .ReturnsAsync(user);

        _passwordServiceMock.Setup(x => x.VerifyPassword(loginRequest.Password, user.PasswordHash))
            .Returns(false);

        // Act & Assert
        var act = async () => await _authService.LoginAsync(loginRequest);
        await act.Should().ThrowAsync<Application.Exceptions.UnauthorizedException>();
    }

    [Fact]
    public async Task RegisterAsync_WithValidRequest_ShouldReturnAuthResponse()
    {
        // Arrange
        var registerRequest = new RegisterRequestDto
        {
            Email = "newuser@example.com",
            Password = "Password123!",
            FirstName = "Jane",
            LastName = "Doe",
            PhoneNumber = "0986123456",
            DeviceId = "device123"
        };

        var validationResult = new ValidationResult();
        var hashedPassword = "hashed_password";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = registerRequest.Email,
            FirstName = registerRequest.FirstName,
            LastName = registerRequest.LastName,
            PhoneNumber = registerRequest.PhoneNumber!,
            PasswordHash = hashedPassword,
            IsActive = true
        };

        var authResponse = new AuthResponseDto
        {
            AccessToken = "access_token",
            RefreshToken = "refresh_token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            }
        };

        _registerValidatorMock.Setup(x => x.ValidateAsync(registerRequest, default))
            .ReturnsAsync(validationResult);

        _userRepositoryMock.Setup(x => x.GetByEmailOrPhoneAsync(registerRequest.Email))
            .ReturnsAsync((User?)null);

        _passwordServiceMock.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns(hashedPassword);

        _userRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync(user);

        _tokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<IEnumerable<string>>(), It.IsAny<IEnumerable<string>>()))
            .Returns("access_token");

        _tokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");

        // Act
        var result = await _authService.RegisterAsync(registerRequest);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("access_token");
        result.RefreshToken.Should().Be("refresh_token");
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldThrowUserAlreadyExistsException()
    {
        // Arrange
        var registerRequest = new RegisterRequestDto
        {
            Email = "existing@example.com",
            Password = "Password123!",
            FirstName = "Jane",
            LastName = "Doe",
            DeviceId = "device123"
        };

        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "existing@example.com",
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "0986123456",
            PasswordHash = "hashed_password",
            IsActive = true
        };

        var validationResult = new ValidationResult();

        _registerValidatorMock.Setup(x => x.ValidateAsync(registerRequest, default))
            .ReturnsAsync(validationResult);

        _userRepositoryMock.Setup(x => x.GetByEmailOrPhoneAsync(registerRequest.Email))
            .ReturnsAsync(existingUser);

        // Act & Assert
        var act = async () => await _authService.RegisterAsync(registerRequest);
        await act.Should().ThrowAsync<Application.Exceptions.ConflictException>();
    }

    [Fact]
    public async Task RefreshTokenAsync_WithValidToken_ShouldReturnNewTokens()
    {
        // Arrange
        var refreshTokenRequest = new RefreshTokenRequestDto
        {
            RefreshToken = "valid_refresh_token",
            DeviceId = "device123"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "0986123456",
            PasswordHash = "hashed_password",
            IsActive = true
        };

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = refreshTokenRequest.RefreshToken,
            DeviceId = refreshTokenRequest.DeviceId,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };

        _refreshTokenRepositoryMock.Setup(x => x.GetByTokenAsync(refreshTokenRequest.RefreshToken))
            .ReturnsAsync(refreshToken);

        _userRepositoryMock.Setup(x => x.GetByIdAsync(user.Id))
            .ReturnsAsync(user);

        _tokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<IEnumerable<string>>(), It.IsAny<IEnumerable<string>>()))
            .Returns("new_access_token");

        _tokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("new_refresh_token");

        // Act
        var result = await _authService.RefreshTokenAsync(refreshTokenRequest);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("new_access_token");
        result.RefreshToken.Should().Be("new_refresh_token");
    }

    [Fact]
    public async Task LogoutAsync_WithValidToken_ShouldRevokeToken()
    {
        // Arrange
        var logoutRequest = new LogoutRequestDto
        {
            RefreshToken = "valid_refresh_token",
            DeviceId = "device123"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "0986123456",
            PasswordHash = "hashed_password",
            IsActive = true
        };

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = logoutRequest.RefreshToken,
            DeviceId = logoutRequest.DeviceId,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };

        _refreshTokenRepositoryMock.Setup(x => x.GetByTokenAsync(logoutRequest.RefreshToken))
            .ReturnsAsync(refreshToken);

        // Act
        await _authService.LogoutAsync(logoutRequest);

        // Assert
        _refreshTokenRepositoryMock.Verify(x => x.RevokeAsync(logoutRequest.RefreshToken, It.IsAny<string>()), Times.Once);
    }
}
