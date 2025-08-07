using Google.Apis.Auth;
using cms_api.Models;
using cms_api.Data;
using Microsoft.EntityFrameworkCore;
using cms_api.DTOs;

namespace cms_api.Services
{
    public interface IGoogleAuthService
    {
        Task<User?> AuthenticateGoogleUser(string idToken);
    }

    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<GoogleAuthService> _logger;

        public GoogleAuthService(IConfiguration configuration, ApplicationDbContext context, ILogger<GoogleAuthService> logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }

        public async Task<User?> AuthenticateGoogleUser(string idToken)
        {
            try
            {
                var googleSettings = _configuration.GetSection("GoogleAuth");
                var clientId = googleSettings["ClientId"];

                // Verify the Google ID token
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new[] { clientId }
                });

                if (payload == null)
                {
                    _logger.LogWarning("Invalid Google ID token");
                    return null;
                }

                // Check if user already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == payload.Email || 
                                            (u.Provider == "Google" && u.ProviderId == payload.Subject));

                if (existingUser != null)
                {
                    // Update existing user information
                    existingUser.FirstName = payload.GivenName ?? "";
                    existingUser.LastName = payload.FamilyName ?? "";
                    existingUser.ProfilePictureUrl = payload.Picture;
                    existingUser.UpdatedAt = DateTime.UtcNow;
                    
                    await _context.SaveChangesAsync();
                    return existingUser;
                }

                // Create new user
                var newUser = new User
                {
                    Email = payload.Email,
                    FirstName = payload.GivenName ?? "",
                    LastName = payload.FamilyName ?? "",
                    ProfilePictureUrl = payload.Picture,
                    Provider = "Google",
                    ProviderId = payload.Subject,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Created new user: {newUser.Email}");
                return newUser;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating Google user");
                return null;
            }
        }
    }
}
