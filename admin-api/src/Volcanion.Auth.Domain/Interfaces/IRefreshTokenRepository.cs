using Volcanion.Auth.Domain.Entities;

namespace Volcanion.Auth.Domain.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<IEnumerable<RefreshToken>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(Guid userId);
    Task<RefreshToken> CreateAsync(RefreshToken refreshToken);
    Task<RefreshToken> UpdateAsync(RefreshToken refreshToken);
    Task DeleteAsync(Guid id);
    Task RevokeAsync(string token, string? revokedByIp = null);
    Task RevokeAllByUserIdAsync(Guid userId, string? revokedByIp = null);
    Task RevokeByDeviceIdAsync(Guid userId, string deviceId, string? revokedByIp = null);
    Task CleanupExpiredTokensAsync();
}
