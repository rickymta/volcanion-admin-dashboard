using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.DTOs.User;
using Volcanion.Auth.Application.Interfaces;

namespace Volcanion.Auth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        try
        {
            var userId = GetCurrentUserId();
            var user = await _userService.GetCurrentUserAsync(userId);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("profile")]
    public async Task<ActionResult<UpdateUserResponseDto>> UpdateProfile([FromBody] UpdateUserRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _userService.UpdateUserAsync(userId, request);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _userService.ChangePasswordAsync(userId, request);
            
            if (result)
                return Ok(new { message = "Password changed successfully" });
            
            return BadRequest(new { message = "Failed to change password" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeactivateUser(Guid id)
    {
        try
        {
            var result = await _userService.DeactivateUserAsync(id);
            
            if (result)
                return Ok(new { message = "User deactivated successfully" });
            
            return BadRequest(new { message = "Failed to deactivate user" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ActivateUser(Guid id)
    {
        try
        {
            var result = await _userService.ActivateUserAsync(id);
            
            if (result)
                return Ok(new { message = "User activated successfully" });
            
            return BadRequest(new { message = "Failed to activate user" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid user ID in token");
        
        return userId;
    }
}
