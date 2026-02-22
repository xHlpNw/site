namespace AutoSeller.Api.Models;

public class Car
{
    public int Id { get; set; }
    public int BrandId { get; set; }
    public int ModelId { get; set; }
    public int Year { get; set; }
    public int Mileage { get; set; }
    public string Gearbox { get; set; } = string.Empty;  // at, mt
    public string DriveType { get; set; } = string.Empty; // fwd, rwd, awd
    public string BodyType { get; set; } = string.Empty;  // sedan, suv, coupe, ...
    public string Engine { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public string SellerId { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Active";  // Active, Moderation

    public Brand Brand { get; set; } = null!;
    public Model Model { get; set; } = null!;
    public ApplicationUser Seller { get; set; } = null!;
    public ICollection<CarPhoto> Photos { get; set; } = new List<CarPhoto>();
}
