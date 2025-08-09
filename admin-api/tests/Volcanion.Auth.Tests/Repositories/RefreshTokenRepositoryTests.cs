using AutoFixture;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Volcanion.Auth.Domain.Entities;
using Volcanion.Auth.Infrastructure.Data;
using Volcanion.Auth.Infrastructure.Repositories;
using Xunit;

namespace Volcanion.Auth.Infrastructure.Tests.Repositories;

/// <summary>
/// Unit tests for RefreshTokenRepository
/// </summary>
public class RefreshTokenRepositoryTests : IDisposable
{
    private readonly AuthDbContext _context;
    private readonly RefreshTokenRepository _repository;
    private readonly Fixture _fixture;
    private readonly List<User> _testUsers;
    private readonly List<RefreshToken> _testTokens;

    public RefreshTokenRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AuthDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AuthDbContext(options);
        _repository = new RefreshTokenRepository(_context);
        _fixture = new Fixture();

        // Configure AutoFixture to handle circular references
        _fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
            .ForEach(b => _fixture.Behaviors.Remove(b));
        _fixture.Behaviors.Add(new OmitOnRecursionBehavior());

        _testUsers = new List<User>();
        _testTokens = new List<RefreshToken>();

        // Seed database with test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        // Create test users
        var user1 = new User
        {
            Id = Guid.NewGuid(),
            Email = "user1@example.com",
            PasswordHash = "password123",
            PhoneNumber = "1234567890",
            FirstName = "User",
            LastName = "One",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var user2 = new User
        {
            Id = Guid.NewGuid(),
            Email = "user2@example.com",
            PasswordHash = "password456",
            PhoneNumber = "9876543210",
            FirstName = "User",
            LastName = "Two",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _testUsers.AddRange(new[] { user1, user2 });
        _context.Users.AddRange(_testUsers);

        // Create test refresh tokens
        var token1 = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user1.Id,
            Token = "token1",
            DeviceId = "device1",
            DeviceName = "iPhone 12",
            UserAgent = "iOS App",
            IpAddress = "192.168.1.1",
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            User = user1
        };

        var token2 = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user1.Id,
            Token = "token2",
            DeviceId = "device2",
            DeviceName = "MacBook Pro",
            UserAgent = "Web Browser",
            IpAddress = "192.168.1.2",
            CreatedAt = DateTime.UtcNow.AddDays(-3),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            RevokedAt = DateTime.UtcNow.AddDays(-1),
            RevokedByIp = "192.168.1.2",
            User = user1
        };

        var token3 = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user2.Id,
            Token = "token3",
            DeviceId = "device3",
            DeviceName = "Android Phone",
            UserAgent = "Android App",
            IpAddress = "192.168.1.3",
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            ExpiresAt = DateTime.UtcNow.AddDays(-1), // Expired
            User = user2
        };

        _testTokens.AddRange(new[] { token1, token2, token3 });
        _context.RefreshTokens.AddRange(_testTokens);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetByTokenAsync_WithValidToken_ShouldReturnToken()
    {
        // Arrange
        var token = _testTokens.First();

        // Act
        var result = await _repository.GetByTokenAsync(token.Token);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(token.Id);
        result.Token.Should().Be(token.Token);
        result.User.Should().NotBeNull();
        result.User.Email.Should().Be(token.User.Email);
    }

    [Fact]
    public async Task GetByTokenAsync_WithInvalidToken_ShouldReturnNull()
    {
        // Arrange
        var invalidToken = "invalid-token";

        // Act
        var result = await _repository.GetByTokenAsync(invalidToken);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByUserIdAsync_WithValidUserId_ShouldReturnUserTokens()
    {
        // Arrange
        var user = _testUsers.First();

        // Act
        var result = await _repository.GetByUserIdAsync(user.Id);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(rt => rt.UserId == user.Id);
        result.Should().BeInDescendingOrder(rt => rt.CreatedAt);
    }

    [Fact]
    public async Task GetByUserIdAsync_WithInvalidUserId_ShouldReturnEmpty()
    {
        // Arrange
        var invalidUserId = Guid.NewGuid();

        // Act
        var result = await _repository.GetByUserIdAsync(invalidUserId);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetActiveByUserIdAsync_WithValidUserId_ShouldReturnOnlyActiveTokens()
    {
        // Arrange
        var user = _testUsers.First();

        // Act
        var result = await _repository.GetActiveByUserIdAsync(user.Id);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(rt => rt.UserId == user.Id && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow);
        result.Should().BeInDescendingOrder(rt => rt.CreatedAt);
    }

    [Fact]
    public async Task CreateAsync_WithValidToken_ShouldCreateToken()
    {
        // Arrange
        var user = _testUsers.First();
        var newToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "new-token",
            DeviceId = "new-device",
            DeviceName = "New Device",
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            User = user
        };

        // Act
        var result = await _repository.CreateAsync(newToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(newToken.Id);
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));

        // Verify it's saved to database
        var saved = await _context.RefreshTokens.FindAsync(newToken.Id);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_WithValidToken_ShouldUpdateToken()
    {
        // Arrange
        var token = _testTokens.First();
        token.RevokedAt = DateTime.UtcNow;
        token.RevokedByIp = "192.168.1.100";

        // Act
        var result = await _repository.UpdateAsync(token);

        // Assert
        result.Should().NotBeNull();
        result.RevokedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        result.RevokedByIp.Should().Be("192.168.1.100");

        // Verify it's saved to database
        var updated = await _context.RefreshTokens.FindAsync(token.Id);
        updated!.RevokedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ShouldDeleteToken()
    {
        // Arrange
        var token = _testTokens.First();
        var tokenId = token.Id;

        // Act
        await _repository.DeleteAsync(tokenId);

        // Assert
        var deleted = await _context.RefreshTokens.FindAsync(tokenId);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithInvalidId_ShouldNotThrow()
    {
        // Arrange
        var invalidId = Guid.NewGuid();

        // Act & Assert
        var act = () => _repository.DeleteAsync(invalidId);
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task RevokeAsync_WithValidToken_ShouldRevokeToken()
    {
        // Arrange
        var token = _testTokens.First(t => t.RevokedAt == null);
        var revokedByIp = "192.168.1.200";

        // Act
        await _repository.RevokeAsync(token.Token, revokedByIp);

        // Assert
        var revoked = await _context.RefreshTokens.FindAsync(token.Id);
        revoked!.RevokedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        revoked.RevokedByIp.Should().Be(revokedByIp);
    }

    [Fact]
    public async Task RevokeAsync_WithInvalidToken_ShouldNotThrow()
    {
        // Arrange
        var invalidToken = "invalid-token";

        // Act & Assert
        var act = () => _repository.RevokeAsync(invalidToken);
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task RevokeAllByUserIdAsync_WithValidUserId_ShouldRevokeAllActiveTokens()
    {
        // Arrange
        var user = _testUsers.First();
        var revokedByIp = "192.168.1.300";

        // Get tokens that are currently active (not revoked and not expired) before the operation
        var activeTokensBeforeRevoke = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        // Act
        await _repository.RevokeAllByUserIdAsync(user.Id, revokedByIp);

        // Assert
        var userTokensAfterRevoke = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id)
            .ToListAsync();

        // Check that previously active tokens are now revoked with correct IP
        foreach (var originalActiveToken in activeTokensBeforeRevoke)
        {
            var updatedToken = userTokensAfterRevoke.First(rt => rt.Id == originalActiveToken.Id);
            updatedToken.RevokedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
            updatedToken.RevokedByIp.Should().Be(revokedByIp);
        }

        // Check that already revoked or expired tokens are not affected
        var alreadyRevokedTokens = userTokensAfterRevoke.Where(rt => 
            !activeTokensBeforeRevoke.Any(abt => abt.Id == rt.Id));
        
        foreach (var alreadyRevokedToken in alreadyRevokedTokens)
        {
            // These should maintain their original revoke status
            if (alreadyRevokedToken.Token == "token2") // This was already revoked in seed data
            {
                alreadyRevokedToken.RevokedByIp.Should().Be("192.168.1.2"); // Original IP should remain
                alreadyRevokedToken.RevokedAt.Should().BeCloseTo(DateTime.UtcNow.AddDays(-1), TimeSpan.FromSeconds(1));
            }
        }
    }

    [Fact]
    public async Task RevokeByDeviceIdAsync_WithValidParameters_ShouldRevokeDeviceTokens()
    {
        // Arrange
        var user = _testUsers.First();
        var deviceId = _testTokens.First(t => t.UserId == user.Id && t.RevokedAt == null).DeviceId;
        var revokedByIp = "192.168.1.400";

        // Act
        await _repository.RevokeByDeviceIdAsync(user.Id, deviceId, revokedByIp);

        // Assert
        var deviceTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id && rt.DeviceId == deviceId)
            .ToListAsync();

        deviceTokens.Should().AllSatisfy(rt =>
        {
            rt.RevokedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
            rt.RevokedByIp.Should().Be(revokedByIp);
        });
    }

    [Fact]
    public async Task CleanupExpiredTokensAsync_ShouldRemoveExpiredTokens()
    {
        // Arrange
        var expiredTokensBefore = await _context.RefreshTokens
            .Where(rt => rt.ExpiresAt <= DateTime.UtcNow)
            .CountAsync();

        // Act
        await _repository.CleanupExpiredTokensAsync();

        // Assert
        var expiredTokensAfter = await _context.RefreshTokens
            .Where(rt => rt.ExpiresAt <= DateTime.UtcNow)
            .CountAsync();

        expiredTokensAfter.Should().Be(0);
        expiredTokensBefore.Should().BeGreaterThan(0); // Ensure we had expired tokens to clean
    }

    [Fact]
    public void RefreshToken_IsExpired_ShouldReturnCorrectValue()
    {
        // Arrange
        var expiredToken = new RefreshToken
        {
            ExpiresAt = DateTime.UtcNow.AddDays(-1)
        };

        var activeToken = new RefreshToken
        {
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };

        // Act & Assert
        expiredToken.IsExpired.Should().BeTrue();
        activeToken.IsExpired.Should().BeFalse();
    }

    [Fact]
    public void RefreshToken_IsRevoked_ShouldReturnCorrectValue()
    {
        // Arrange
        var revokedToken = new RefreshToken
        {
            RevokedAt = DateTime.UtcNow
        };

        var activeToken = new RefreshToken
        {
            RevokedAt = null
        };

        // Act & Assert
        revokedToken.IsRevoked.Should().BeTrue();
        activeToken.IsRevoked.Should().BeFalse();
    }

    [Fact]
    public void RefreshToken_IsActive_ShouldReturnCorrectValue()
    {
        // Arrange
        var activeToken = new RefreshToken
        {
            ExpiresAt = DateTime.UtcNow.AddDays(1),
            RevokedAt = null
        };

        var expiredToken = new RefreshToken
        {
            ExpiresAt = DateTime.UtcNow.AddDays(-1),
            RevokedAt = null
        };

        var revokedToken = new RefreshToken
        {
            ExpiresAt = DateTime.UtcNow.AddDays(1),
            RevokedAt = DateTime.UtcNow
        };

        // Act & Assert
        activeToken.IsActive.Should().BeTrue();
        expiredToken.IsActive.Should().BeFalse();
        revokedToken.IsActive.Should().BeFalse();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
