using Microsoft.AspNetCore.Mvc;
using cms_api.Services;
using cms_api.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace cms_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IGoogleAuthService _googleAuthService;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IGoogleAuthService googleAuthService, IJwtService jwtService, ILogger<AuthController> logger)
        {
            _googleAuthService = googleAuthService;
            _jwtService = jwtService;
            _logger = logger;
        }

        /// <summary>
        /// Đăng nhập bằng Google
        /// </summary>
        /// <param name="request">Google ID Token</param>
        /// <returns>JWT Token và thông tin user</returns>
        [HttpPost("google-login")]
        public async Task<ActionResult<LoginResponse>> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.IdToken))
                {
                    return BadRequest("ID Token is required");
                }

                var user = await _googleAuthService.AuthenticateGoogleUser(request.IdToken);
                
                if (user == null)
                {
                    return Unauthorized("Invalid Google ID Token");
                }

                var token = _jwtService.GenerateToken(user.Id, user.Email);

                var response = new LoginResponse
                {
                    Token = token,
                    User = new UserDto
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
                    }
                };

                _logger.LogInformation($"User {user.Email} logged in successfully");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Google login");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Lấy thông tin profile của user hiện tại
        /// </summary>
        /// <returns>Thông tin user</returns>
        [HttpGet("profile")]
        [Authorize]
        public ActionResult<UserDto> GetProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(email))
                {
                    return Unauthorized();
                }

                // Trong thực tế, bạn nên lấy thông tin user từ database
                // Đây chỉ là ví dụ đơn giản
                return Ok(new { 
                    UserId = userIdClaim, 
                    Email = email,
                    Message = "Profile retrieved successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
