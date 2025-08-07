using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using cms_api.Data;
using cms_api.Models;
using cms_api.DTOs;
using cms_api.Hubs;

namespace cms_api.Services
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request, int? senderId = null);
        Task<NotificationDto> SendNotificationToUserAsync(SendNotificationToUserRequest request, int? senderId = null);
        Task<List<NotificationDto>> SendBulkNotificationAsync(BulkNotificationRequest request, int? senderId = null);
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20);
        Task<bool> MarkAsReadAsync(int notificationId, int userId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<int> GetUnreadNotificationCountAsync(int userId);
        Task<NotificationStatsDto> GetNotificationStatsAsync(int userId);
        Task<bool> DeleteNotificationAsync(int notificationId, int userId);
    }

    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            ApplicationDbContext context,
            IHubContext<NotificationHub> hubContext,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request, int? senderId = null)
        {
            var notification = new Notification
            {
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                ActionUrl = request.ActionUrl,
                ActionText = request.ActionText,
                UserId = request.UserId,
                SenderId = senderId,
                MetaData = request.MetaData,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Load related data
            await _context.Entry(notification)
                .Reference(n => n.Sender)
                .LoadAsync();

            var notificationDto = MapToDto(notification);

            // Gửi thông báo qua SignalR
            await SendNotificationViaSignalR(notificationDto);

            _logger.LogInformation($"Created notification {notification.Id} for user {request.UserId}");

            return notificationDto;
        }

        public async Task<NotificationDto> SendNotificationToUserAsync(SendNotificationToUserRequest request, int? senderId = null)
        {
            var createRequest = new CreateNotificationRequest
            {
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                ActionUrl = request.ActionUrl,
                ActionText = request.ActionText,
                UserId = request.UserId,
                MetaData = request.MetaData
            };

            return await CreateNotificationAsync(createRequest, senderId);
        }

        public async Task<List<NotificationDto>> SendBulkNotificationAsync(BulkNotificationRequest request, int? senderId = null)
        {
            var notifications = new List<NotificationDto>();

            foreach (var userId in request.UserIds)
            {
                var createRequest = new CreateNotificationRequest
                {
                    Title = request.Title,
                    Message = request.Message,
                    Type = request.Type,
                    ActionUrl = request.ActionUrl,
                    ActionText = request.ActionText,
                    UserId = userId,
                    MetaData = request.MetaData
                };

                var notification = await CreateNotificationAsync(createRequest, senderId);
                notifications.Add(notification);
            }

            _logger.LogInformation($"Sent bulk notification to {request.UserIds.Count} users");

            return notifications;
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .Include(n => n.Sender)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return notifications.Select(MapToDto).ToList();
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null || notification.IsRead)
            {
                return false;
            }

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            notification.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Marked notification {notificationId} as read for user {userId}");

            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (!unreadNotifications.Any())
            {
                return true;
            }

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                notification.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Gửi cập nhật về client
            await _hubContext.Clients.Group($"User_{userId}")
                .SendAsync("UnreadCountUpdated", 0);

            _logger.LogInformation($"Marked {unreadNotifications.Count} notifications as read for user {userId}");

            return true;
        }

        public async Task<int> GetUnreadNotificationCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task<NotificationStatsDto> GetNotificationStatsAsync(int userId)
        {
            var stats = await _context.Notifications
                .Where(n => n.UserId == userId)
                .GroupBy(n => 1)
                .Select(g => new NotificationStatsDto
                {
                    TotalNotifications = g.Count(),
                    UnreadCount = g.Count(n => !n.IsRead),
                    ReadCount = g.Count(n => n.IsRead),
                    LastNotificationTime = g.Max(n => (DateTime?)n.CreatedAt)
                })
                .FirstOrDefaultAsync();

            return stats ?? new NotificationStatsDto();
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
            {
                return false;
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Deleted notification {notificationId} for user {userId}");

            return true;
        }

        private async Task SendNotificationViaSignalR(NotificationDto notification)
        {
            try
            {
                // Gửi thông báo tới user cụ thể
                await _hubContext.Clients.Group($"User_{notification.UserId}")
                    .SendAsync("ReceiveNotification", notification);

                // Cập nhật số lượng thông báo chưa đọc
                var unreadCount = await GetUnreadNotificationCountAsync(notification.UserId);
                await _hubContext.Clients.Group($"User_{notification.UserId}")
                    .SendAsync("UnreadCountUpdated", unreadCount);

                _logger.LogInformation($"Sent notification {notification.Id} via SignalR to user {notification.UserId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending notification {notification.Id} via SignalR");
            }
        }

        private static NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                ActionUrl = notification.ActionUrl,
                ActionText = notification.ActionText,
                UserId = notification.UserId,
                SenderId = notification.SenderId,
                SenderName = notification.Sender != null ? notification.Sender.FullName : null,
                IsRead = notification.IsRead,
                ReadAt = notification.ReadAt,
                CreatedAt = notification.CreatedAt,
                MetaData = notification.MetaData
            };
        }
    }
}
