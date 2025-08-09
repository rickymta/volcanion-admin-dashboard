using Microsoft.EntityFrameworkCore;
using Volcanion.Auth.Domain.Entities;

namespace Volcanion.Auth.Infrastructure.Data;

/// <summary>
/// Database context for the authentication system with Entity Framework Core
/// </summary>
public class AuthDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the <see cref="AuthDbContext"/> class
    /// </summary>
    /// <param name="options">The options for this context</param>
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Gets or sets the users table
    /// </summary>
    public DbSet<User> Users { get; set; }
    
    /// <summary>
    /// Gets or sets the roles table
    /// </summary>
    public DbSet<Role> Roles { get; set; }
    
    /// <summary>
    /// Gets or sets the permissions table
    /// </summary>
    public DbSet<Permission> Permissions { get; set; }
    
    /// <summary>
    /// Gets or sets the user-role associations table
    /// </summary>
    public DbSet<UserRole> UserRoles { get; set; }
    
    /// <summary>
    /// Gets or sets the role-permission associations table
    /// </summary>
    public DbSet<RolePermission> RolePermissions { get; set; }
    
    /// <summary>
    /// Gets or sets the refresh tokens table
    /// </summary>
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    /// <summary>
    /// Configures the database schema and relationships
    /// </summary>
    /// <param name="modelBuilder">The builder being used to construct the model for this context</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Avatar).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.PhoneNumber).IsUnique().HasFilter("[PhoneNumber] IS NOT NULL");
        });

        // Role entity configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Permission entity configuration
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Resource).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasIndex(e => new { e.Resource, e.Action }).IsUnique();
        });

        // UserRole entity configuration
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RoleId });
            entity.Property(e => e.AssignedAt).IsRequired();

            entity.HasOne(e => e.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // RolePermission entity configuration
        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => new { e.RoleId, e.PermissionId });
            entity.Property(e => e.GrantedAt).IsRequired();

            entity.HasOne(e => e.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(e => e.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // RefreshToken entity configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.Property(e => e.DeviceId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.DeviceName).HasMaxLength(200);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.RevokedByIp).HasMaxLength(45);
            entity.Property(e => e.ReplacedByToken).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.ExpiresAt).IsRequired();

            entity.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.DeviceId });
        });

        // Seed default data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed default roles
        var adminRoleId = Guid.NewGuid();
        var userRoleId = Guid.NewGuid();

        modelBuilder.Entity<Role>().HasData(
            new Role
            {
                Id = adminRoleId,
                Name = "Admin",
                Description = "Administrator role with full access",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Role
            {
                Id = userRoleId,
                Name = "User",
                Description = "Standard user role",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        // Seed default permissions
        var permissions = new[]
        {
            new { Id = Guid.NewGuid(), Name = "users.read", Resource = "users", Action = "read" },
            new { Id = Guid.NewGuid(), Name = "users.write", Resource = "users", Action = "write" },
            new { Id = Guid.NewGuid(), Name = "users.delete", Resource = "users", Action = "delete" },
            new { Id = Guid.NewGuid(), Name = "roles.read", Resource = "roles", Action = "read" },
            new { Id = Guid.NewGuid(), Name = "roles.write", Resource = "roles", Action = "write" },
            new { Id = Guid.NewGuid(), Name = "roles.delete", Resource = "roles", Action = "delete" },
            new { Id = Guid.NewGuid(), Name = "profile.read", Resource = "profile", Action = "read" },
            new { Id = Guid.NewGuid(), Name = "profile.write", Resource = "profile", Action = "write" }
        };

        modelBuilder.Entity<Permission>().HasData(
            permissions.Select(p => new Permission
            {
                Id = p.Id,
                Name = p.Name,
                Resource = p.Resource,
                Action = p.Action,
                Description = $"Permission to {p.Action} {p.Resource}",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }).ToArray()
        );

        // Assign all permissions to admin role
        modelBuilder.Entity<RolePermission>().HasData(
            permissions.Select(p => new RolePermission
            {
                RoleId = adminRoleId,
                PermissionId = p.Id,
                GrantedAt = DateTime.UtcNow,
                IsActive = true
            }).ToArray()
        );

        // Assign basic permissions to user role
        var userPermissions = permissions.Where(p => p.Resource == "profile").ToArray();
        modelBuilder.Entity<RolePermission>().HasData(
            userPermissions.Select(p => new RolePermission
            {
                RoleId = userRoleId,
                PermissionId = p.Id,
                GrantedAt = DateTime.UtcNow,
                IsActive = true
            }).ToArray()
        );
    }
}
