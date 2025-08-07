using System.ComponentModel.DataAnnotations;

namespace cms_api.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? ActionUrl { get; set; }
        public string? ActionText { get; set; }
        public int UserId { get; set; }
        public int? SenderId { get; set; }
        public string? SenderName { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? MetaData { get; set; }
    }

    public class CreateNotificationRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Type { get; set; } = "Info";

        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        [MaxLength(100)]
        public string? ActionText { get; set; }

        public int UserId { get; set; }
        
        public string? MetaData { get; set; }
    }

    public class SendNotificationToUserRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = "Info";
        public string? ActionUrl { get; set; }
        public string? ActionText { get; set; }
        public string? MetaData { get; set; }
    }

    public class BulkNotificationRequest
    {
        [Required]
        public List<int> UserIds { get; set; } = new();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = "Info";
        public string? ActionUrl { get; set; }
        public string? ActionText { get; set; }
        public string? MetaData { get; set; }
    }

    public class MarkAsReadRequest
    {
        [Required]
        public int NotificationId { get; set; }
    }

    public class NotificationStatsDto
    {
        public int TotalNotifications { get; set; }
        public int UnreadCount { get; set; }
        public int ReadCount { get; set; }
        public DateTime? LastNotificationTime { get; set; }
    }
}
