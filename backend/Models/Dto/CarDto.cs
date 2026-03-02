namespace AutoSeller.Api.Models.Dto;

public class CarListItemDto
{
    public int Id { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public string ModelName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Mileage { get; set; }
    public string Gearbox { get; set; } = string.Empty;
    public string DriveType { get; set; } = string.Empty;
    public string BodyType { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool HasPhoto { get; set; }
    public DateTime CreatedAt { get; set; }
    /// <summary>Заполняется только для GET /api/cars/my (Active, Moderation и т.д.).</summary>
    public string? Status { get; set; }
}

public class CarDetailDto
{
    public int Id { get; set; }
    public int BrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public int ModelId { get; set; }
    public string ModelName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Mileage { get; set; }
    public string Gearbox { get; set; } = string.Empty;
    public string DriveType { get; set; } = string.Empty;
    public string BodyType { get; set; } = string.Empty;
    public string Engine { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public int PhotoCount { get; set; }
    public SellerDto Seller { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class SellerDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
}
