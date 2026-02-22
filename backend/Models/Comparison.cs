namespace AutoSeller.Api.Models;

public class Comparison
{
    public string UserId { get; set; } = null!;
    public int CarId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
    public Car Car { get; set; } = null!;
}
