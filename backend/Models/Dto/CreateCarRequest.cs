namespace AutoSeller.Api.Models.Dto;

public class CreateCarRequest
{
    public int BrandId { get; set; }
    public int ModelId { get; set; }
    public int Year { get; set; }
    public int Mileage { get; set; }
    public string Gearbox { get; set; } = string.Empty;  // at, mt
    public string DriveType { get; set; } = string.Empty; // fwd, rwd, awd
    public string BodyType { get; set; } = string.Empty;
    public string Engine { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<PhotoItemDto>? Photos { get; set; }
}

public class PhotoItemDto
{
    public string DataBase64 { get; set; } = string.Empty;
    public string MimeType { get; set; } = "image/jpeg";
}
