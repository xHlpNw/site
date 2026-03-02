using Microsoft.AspNetCore.Identity;

namespace AutoSeller.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;

    public ICollection<Car> Cars { get; set; } = new List<Car>();
    public ICollection<Comparison> Comparisons { get; set; } = new List<Comparison>();
    public ICollection<Favourite> Favourites { get; set; } = new List<Favourite>();
}
