using FluentValidation;
using Volcanion.Auth.Application.DTOs.User;

namespace Volcanion.Auth.Application.Validators;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequestDto>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("First name is required")
            .MaximumLength(100)
            .WithMessage("First name cannot exceed 100 characters");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Last name is required")
            .MaximumLength(100)
            .WithMessage("Last name cannot exceed 100 characters");

        RuleFor(x => x.PhoneNumber)
            .Must(BeValidVietnamesePhoneNumber)
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Invalid Vietnamese phone number format");
    }

    private bool BeValidVietnamesePhoneNumber(string? phoneNumber)
    {
        if (string.IsNullOrEmpty(phoneNumber)) return true;
        
        try
        {
            Volcanion.Auth.Domain.ValueObjects.PhoneNumber.Create(phoneNumber);
            return true;
        }
        catch
        {
            return false;
        }
    }
}


