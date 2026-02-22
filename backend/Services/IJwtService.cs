using AutoSeller.Api.Models;

namespace AutoSeller.Api.Services;

public interface IJwtService
{
    string GenerateToken(ApplicationUser user);
}
