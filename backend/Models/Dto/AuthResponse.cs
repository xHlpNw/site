namespace AutoSeller.Api.Models.Dto;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserInfoDto User { get; set; } = null!;
}

public class UserInfoDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}
