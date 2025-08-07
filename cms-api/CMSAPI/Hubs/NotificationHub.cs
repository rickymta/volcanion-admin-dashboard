using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using cms_api.Services;
using cms_api.DTOs;

namespace cms_api.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(INotificationService notificationService, ILogger<NotificationHub> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
                // Thêm user vào group để có thể gửi thông báo riêng
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId.Value}");
                
                _logger.LogInformation($"User {userId.Value} connected to notification hub with connection {Context.ConnectionId}");
                
                // Gửi số lượng thông báo chưa đọc khi user kết nối
                var unreadCount = await _notificationService.GetUnreadNotificationCountAsync(userId.Value);
                await Clients.Caller.SendAsync("UnreadCountUpdated", unreadCount);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId.Value}");
                _logger.LogInformation($"User {userId.Value} disconnected from notification hub");
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Client gọi để đánh dấu thông báo đã đọc
        /// </summary>
        [HubMethodName("MarkNotificationAsRead")]
        public async Task MarkNotificationAsRead(int notificationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    await Clients.Caller.SendAsync("Error", "Unauthorized");
                    return;
                }

                var success = await _notificationService.MarkAsReadAsync(notificationId, userId.Value);
                if (success)
                {
                    // Gửi confirmation về client
                    await Clients.Caller.SendAsync("NotificationMarkedAsRead", notificationId);
                    
                    // Cập nhật số lượng thông báo chưa đọc
                    var unreadCount = await _notificationService.GetUnreadNotificationCountAsync(userId.Value);
                    await Clients.Caller.SendAsync("UnreadCountUpdated", unreadCount);
                    
                    _logger.LogInformation($"Notification {notificationId} marked as read by user {userId.Value}");
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", "Failed to mark notification as read");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking notification {notificationId} as read");
                await Clients.Caller.SendAsync("Error", "Internal server error");
            }
        }

        /// <summary>
        /// Client gọi để lấy danh sách thông báo
        /// </summary>
        [HubMethodName("GetNotifications")]
        public async Task GetNotifications(int page = 1, int pageSize = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    await Clients.Caller.SendAsync("Error", "Unauthorized");
                    return;
                }

                var notifications = await _notificationService.GetUserNotificationsAsync(userId.Value, page, pageSize);
                await Clients.Caller.SendAsync("NotificationsReceived", notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting notifications for user");
                await Clients.Caller.SendAsync("Error", "Internal server error");
            }
        }

        /// <summary>
        /// Client join vào room để nhận thông báo theo nhóm
        /// </summary>
        [HubMethodName("JoinGroup")]
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Caller.SendAsync("JoinedGroup", groupName);
        }

        /// <summary>
        /// Client leave room
        /// </summary>
        [HubMethodName("LeaveGroup")]
        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Caller.SendAsync("LeftGroup", groupName);
        }

        /// <summary>
        /// Lấy userId từ claims
        /// </summary>
        private int? GetCurrentUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}
