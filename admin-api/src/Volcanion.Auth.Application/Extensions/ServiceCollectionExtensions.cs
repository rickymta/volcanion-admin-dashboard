using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using Volcanion.Auth.Application.Interfaces;
using Volcanion.Auth.Application.Mappings;
using Volcanion.Auth.Application.Services;
using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.DTOs.User;
using Volcanion.Auth.Application.Validators;

namespace Volcanion.Auth.Application.Extensions;

/// <summary>
/// Extension methods for configuring application services
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds application layer services to the dependency injection container
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <returns>The service collection for method chaining</returns>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(typeof(AuthMappingProfile));

        // FluentValidation
        services.AddScoped<IValidator<RegisterRequestDto>, RegisterRequestValidator>();
        services.AddScoped<IValidator<LoginRequestDto>, LoginRequestValidator>();
        services.AddScoped<IValidator<UpdateUserRequestDto>, UpdateUserRequestValidator>();
        services.AddScoped<IValidator<ChangePasswordRequestDto>, ChangePasswordRequestValidator>();

        // Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
