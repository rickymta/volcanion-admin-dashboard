using AutoMapper;
using FluentValidation;
using Volcanion.Auth.Application.DTOs.Auth;
using Volcanion.Auth.Application.DTOs.User;
using Volcanion.Auth.Application.Exceptions;
using Volcanion.Auth.Application.Interfaces;
using Volcanion.Auth.Domain.Interfaces;
using Volcanion.Auth.Domain.ValueObjects;

namespace Volcanion.Auth.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ICacheService _cacheService;
    private readonly IPasswordService _passwordService;
    private readonly IMapper _mapper;
    private readonly IValidator<UpdateUserRequestDto> _updateUserValidator;
    private readonly IValidator<ChangePasswordRequestDto> _changePasswordValidator;

    public UserService(
        IUserRepository userRepository,
        ICacheService cacheService,
        IPasswordService passwordService,
        IMapper mapper,
        IValidator<UpdateUserRequestDto> updateUserValidator,
        IValidator<ChangePasswordRequestDto> changePasswordValidator)
    {
        _userRepository = userRepository;
        _cacheService = cacheService;
        _passwordService = passwordService;
        _mapper = mapper;
        _updateUserValidator = updateUserValidator;
        _changePasswordValidator = changePasswordValidator;
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId)
    {
        // Try cache first
        var cachedUser = await _cacheService.GetAsync<UserDto>($"user:{userId}");
        if (cachedUser != null)
            return cachedUser;

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        var userDto = _mapper.Map<UserDto>(user);
        
        // Cache for 15 minutes
        await _cacheService.SetAsync($"user:{userId}", userDto, TimeSpan.FromMinutes(15));
        
        return userDto;
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId)
    {
        return await GetUserByIdAsync(userId);
    }

    public async Task<UpdateUserResponseDto> UpdateUserAsync(Guid userId, UpdateUserRequestDto request)
    {
        var validationResult = await _updateUserValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult.Errors.GroupBy(x => x.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray()));

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User", userId);

        // Validate phone number if provided
        string? normalizedPhone = null;
        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            var phone = PhoneNumber.Create(request.PhoneNumber);
            normalizedPhone = phone.Value;

            // Check if phone number already exists for another user
            var existingUser = await _userRepository.GetByPhoneNumberAsync(normalizedPhone);
            if (existingUser != null && existingUser.Id != userId)
                throw new ConflictException("Phone number already exists");
        }

        // Update user properties
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PhoneNumber = normalizedPhone;
        user.Avatar = request.Avatar;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // Clear cache
        await _cacheService.RemoveAsync($"user:{userId}");

        return _mapper.Map<UpdateUserResponseDto>(user);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request)
    {
        var validationResult = await _changePasswordValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult.Errors.GroupBy(x => x.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray()));

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User", userId);

        // Verify current password
        if (!_passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedException("Current password is incorrect");

        // Hash new password
        user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return true;
    }

    public async Task<bool> DeactivateUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User", userId);

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // Clear cache
        await _cacheService.RemoveAsync($"user:{userId}");

        return true;
    }

    public async Task<bool> ActivateUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User", userId);

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // Clear cache
        await _cacheService.RemoveAsync($"user:{userId}");

        return true;
    }
}
