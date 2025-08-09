using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Volcanion.Auth.Infrastructure.Data;

namespace Volcanion.Auth.Infrastructure.Factories;

/// <summary>
/// Design-time factory for creating AuthDbContext instances during migrations
/// </summary>
public class AuthDbContextFactory : IDesignTimeDbContextFactory<AuthDbContext>
{
    /// <summary>
    /// Creates a new instance of AuthDbContext for design-time operations
    /// </summary>
    /// <param name="args">Command line arguments</param>
    /// <returns>A configured AuthDbContext instance</returns>
    public AuthDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AuthDbContext>();
        
        // Use a default connection string for design-time migrations
        var connectionString = "Server=localhost;Database=VolcanionAuth;User=root;Password=yourpassword;";
        
        optionsBuilder.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 21)));

        return new AuthDbContext(optionsBuilder.Options);
    }
}
