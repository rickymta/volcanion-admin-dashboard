using Microsoft.EntityFrameworkCore;
using cms_api.Models;

namespace cms_api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình cho User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasIndex(e => e.Email)
                      .IsUnique();
                      
                entity.HasIndex(e => new { e.Provider, e.ProviderId })
                      .IsUnique();

                entity.Property(e => e.Email)
                      .IsRequired()
                      .HasMaxLength(255);

                entity.Property(e => e.FirstName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.LastName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.ProfilePictureUrl)
                      .HasMaxLength(500);

                entity.Property(e => e.Provider)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(e => e.ProviderId)
                      .IsRequired()
                      .HasMaxLength(255);

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.UpdatedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            });

            // Cấu hình cho Notification entity
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Title)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(e => e.Message)
                      .IsRequired()
                      .HasMaxLength(1000);

                entity.Property(e => e.Type)
                      .HasMaxLength(50)
                      .HasDefaultValue("Info");

                entity.Property(e => e.ActionUrl)
                      .HasMaxLength(500);

                entity.Property(e => e.ActionText)
                      .HasMaxLength(100);

                entity.Property(e => e.MetaData)
                      .HasMaxLength(2000);

                entity.Property(e => e.IsRead)
                      .HasDefaultValue(false);

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.UpdatedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

                // Foreign key relationships
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Sender)
                      .WithMany()
                      .HasForeignKey(e => e.SenderId)
                      .OnDelete(DeleteBehavior.SetNull);

                // Index for performance
                entity.HasIndex(e => new { e.UserId, e.IsRead });
                entity.HasIndex(e => e.CreatedAt);
            });
        }
    }
}
