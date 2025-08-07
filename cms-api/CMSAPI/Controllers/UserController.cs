using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using cms_api.Data;
using cms_api.DTOs;
using cms_api.Models;
using System.Security.Claims;

namespace cms_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserController> _logger;

        public UserController(ApplicationDbContext context, ILogger<UserController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy thông tin chi tiết của user hiện tại
        /// </summary>
        /// <returns>Thông tin user</returns>
        [HttpGet("profile")]
        public async Task<ActionResult<UserDto>> GetUserProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized("Invalid user token");
                }

                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return NotFound("User not found");
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    FullName = user.FullName,
                    DateOfBirth = user.DateOfBirth,
                    ProfilePictureUrl = user.ProfilePictureUrl,
                    Provider = user.Provider,
                    CreatedAt = user.CreatedAt
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Cập nhật thông tin profile của user
        /// </summary>
        /// <param name="request">Thông tin cần cập nhật</param>
        /// <returns>Thông tin user đã cập nhật</returns>
        [HttpPut("profile")]
        public async Task<ActionResult<UserDto>> UpdateUserProfile([FromBody] UpdateUserProfileRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized("Invalid user token");
                }

                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Cập nhật thông tin
                if (!string.IsNullOrEmpty(request.FirstName))
                {
                    user.FirstName = request.FirstName;
                }

                if (!string.IsNullOrEmpty(request.LastName))
                {
                    user.LastName = request.LastName;
                }

                if (request.DateOfBirth.HasValue)
                {
                    user.DateOfBirth = request.DateOfBirth.Value;
                }

                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    FullName = user.FullName,
                    DateOfBirth = user.DateOfBirth,
                    ProfilePictureUrl = user.ProfilePictureUrl,
                    Provider = user.Provider,
                    CreatedAt = user.CreatedAt
                };

                _logger.LogInformation($"User profile updated: {user.Email}");
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Lấy danh sách tất cả users (chỉ cho admin)
        /// </summary>
        /// <returns>Danh sách users</returns>
        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        Email = u.Email,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        FullName = u.FullName,
                        DateOfBirth = u.DateOfBirth,
                        ProfilePictureUrl = u.ProfilePictureUrl,
                        Provider = u.Provider,
                        CreatedAt = u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    public class UpdateUserProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}
