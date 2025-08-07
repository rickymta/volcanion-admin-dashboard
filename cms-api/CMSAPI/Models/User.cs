using System.ComponentModel.DataAnnotations;

namespace cms_api.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        public string FullName => $"{FirstName} {LastName}";
        
        public DateTime? DateOfBirth { get; set; }
        
        [MaxLength(500)]
        public string? ProfilePictureUrl { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Provider { get; set; } = "Google";
        
        [Required]
        [MaxLength(255)]
        public string ProviderId { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
