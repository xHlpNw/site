using System.ComponentModel.DataAnnotations;

namespace AutoSeller.Api.Models.Dto;

public class RegisterRequest
{
    [Required(ErrorMessage = "Email обязателен")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Пароль обязателен")]
    [MinLength(6, ErrorMessage = "Пароль не менее 6 символов")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Имя обязательно")]
    public string FullName { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }
}
