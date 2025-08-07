using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace cms_api.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Type { get; set; } = "Info"; // Info, Warning, Error, Success

        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        [MaxLength(100)]
        public string? ActionText { get; set; }

        // User nhận thông báo
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        // User gửi thông báo (có thể null nếu là system notification)
        public int? SenderId { get; set; }
        [ForeignKey("SenderId")]
        public virtual User? Sender { get; set; }

        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Metadata dạng JSON
        [MaxLength(2000)]
        public string? MetaData { get; set; }
    }

    public enum NotificationType
    {
        Info,
        Warning,
        Error,
        Success,
        Message,
        System
    }
}
