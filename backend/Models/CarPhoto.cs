namespace AutoSeller.Api.Models;

public class CarPhoto
{
    public int Id { get; set; }
    public int CarId { get; set; }
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string MimeType { get; set; } = "image/jpeg";
    public int Order { get; set; }

    public Car Car { get; set; } = null!;
}
