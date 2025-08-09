using AutoMapper;
using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.DTOs.User;
using Volcanion.Auth.Domain.Entities;

namespace Volcanion.Auth.Application.Mappings;

/// <summary>
/// AutoMapper profile for authentication-related mappings between entities and DTOs
/// </summary>
public class AuthMappingProfile : Profile
{
    /// <summary>
    /// Initializes a new instance of the <see cref="AuthMappingProfile"/> class and configures the mappings
    /// </summary>
    public AuthMappingProfile()
    {
        // Map User entity to UserDto with roles and permissions
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => 
                src.UserRoles.Where(ur => ur.IsActive).Select(ur => ur.Role.Name)))
            .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src =>
                src.UserRoles.Where(ur => ur.IsActive)
                    .SelectMany(ur => ur.Role.RolePermissions.Where(rp => rp.IsActive))
                    .Select(rp => rp.Permission.Name)
                    .Distinct()));

        CreateMap<RegisterRequestDto, User>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.IsEmailVerified, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.IsPhoneVerified, opt => opt.MapFrom(src => false));

        CreateMap<User, UpdateUserResponseDto>();

        CreateMap<UpdateUserRequestDto, User>()
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
            .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.Avatar))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
    }
}
