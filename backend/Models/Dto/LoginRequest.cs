using System.ComponentModel.DataAnnotations;

namespace AutoSeller.Api.Models.Dto;

public class LoginRequest
{
    [Required(ErrorMessage = "Email обязателен")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Пароль обязателен")]
    public string Password { get; set; } = string.Empty;
}
