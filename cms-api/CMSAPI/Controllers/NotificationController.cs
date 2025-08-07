using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using cms_api.Services;
using cms_api.DTOs;

namespace cms_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(INotificationService notificationService, ILogger<NotificationController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách thông báo của user hiện tại
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<NotificationDto>>> GetNotifications(int page = 1, int pageSize = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }

                var notifications = await _notificationService.GetUserNotificationsAsync(userId.Value, page, pageSize);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gửi thông báo tới user cụ thể
        /// </summary>
        [HttpPost("send-to-user")]
        public async Task<ActionResult<NotificationDto>> SendNotificationToUser([FromBody] SendNotificationToUserRequest request)
        {
            try
            {
                var senderId = GetCurrentUserId();
                var notification = await _notificationService.SendNotificationToUserAsync(request, senderId);
                
                _logger.LogInformation($"Notification sent to user {request.UserId} by user {senderId}");
                return Ok(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification to user");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gửi thông báo tới nhiều users
        /// </summary>
        [HttpPost("send-bulk")]
        public async Task<ActionResult<List<NotificationDto>>> SendBulkNotification([FromBody] BulkNotificationRequest request)
        {
            try
            {
                var senderId = GetCurrentUserId();
                var notifications = await _notificationService.SendBulkNotificationAsync(request, senderId);
                
                _logger.LogInformation($"Bulk notification sent to {request.UserIds.Count} users by user {senderId}");
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending bulk notification");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Đánh dấu thông báo đã đọc
        /// </summary>
        [HttpPut("{notificationId}/mark-as-read")]
        public async Task<ActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }

                var success = await _notificationService.MarkAsReadAsync(notificationId, userId.Value);
                if (success)
                {
                    return Ok(new { message = "Notification marked as read" });
                }

                return NotFound("Notification not found or already read");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking notification {notificationId} as read");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Đánh dấu tất cả thông báo đã đọc
        /// </summary>
        [HttpPut("mark-all-as-read")]
        public async Task<ActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }

                await _notificationService.MarkAllAsReadAsync(userId.Value);
                return Ok(new { message = "All notifications marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Lấy số lượng thông báo chưa đọc
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }

                var count = await _notificationService.GetUnreadNotificationCountAsync(userId.Value);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Lấy thống kê thông báo
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<NotificationStatsDto>> GetNotificationStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }

                var stats = await _notificationService.GetNotificationStatsAsync(userId.Value);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification stats");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Xóa thông báo
        /// </summary>
        [HttpDelete("{notificationId}")]
        public async Task<ActionResult> DeleteNotification(int notificationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }

                var success = await _notificationService.DeleteNotificationAsync(notificationId, userId.Value);
                if (success)
                {
                    return Ok(new { message = "Notification deleted successfully" });
                }

                return NotFound("Notification not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting notification {notificationId}");
                return StatusCode(500, "Internal server error");
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}
