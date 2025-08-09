using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.Interfaces;

namespace Volcanion.Auth.Api.Controllers;

/// <summary>
/// Controller for authentication operations including login, register, logout, and token management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthController"/> class
    /// </summary>
    /// <param name="authService">The authentication service</param>
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Authenticates a user and returns access and refresh tokens
    /// </summary>
    /// <param name="request">The login request containing user credentials</param>
    /// <returns>Authentication response with tokens and user information</returns>
    /// <response code="200">Login successful</response>
    /// <response code="400">Invalid request data</response>
    /// <response code="401">Invalid credentials</response>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var ipAddress = GetIpAddress();
            var userAgent = GetUserAgent();
            
            var result = await _authService.LoginAsync(request, ipAddress, userAgent);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var ipAddress = GetIpAddress();
            var userAgent = GetUserAgent();
            
            var result = await _authService.RegisterAsync(request, ipAddress, userAgent);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<RefreshTokenResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            var ipAddress = GetIpAddress();
            
            var result = await _authService.RefreshTokenAsync(request, ipAddress);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout([FromBody] LogoutRequestDto request)
    {
        try
        {
            var ipAddress = GetIpAddress();
            
            await _authService.LogoutAsync(request, ipAddress);
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("logout-all")]
    public async Task<ActionResult> LogoutAll([FromBody] LogoutAllRequestDto request)
    {
        try
        {
            var ipAddress = GetIpAddress();
            
            await _authService.LogoutAllDevicesAsync(request, ipAddress);
            return Ok(new { message = "Logged out from all devices successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("validate-token")]
    public async Task<ActionResult> ValidateToken([FromQuery] string token)
    {
        try
        {
            var isValid = await _authService.ValidateTokenAsync(token);
            return Ok(new { isValid });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private string? GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"];
        
        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
    }

    private string? GetUserAgent()
    {
        return Request.Headers["User-Agent"];
    }
}
