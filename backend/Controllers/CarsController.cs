using System.Security.Claims;
using AutoSeller.Api.Data;
using AutoSeller.Api.Models;
using AutoSeller.Api.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSeller.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CarsController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Каталог объявлений. Фильтры: brandId, modelId, minPrice, maxPrice, yearFrom, yearTo, minMileage, maxMileage, gearbox, driveType, bodyType. Сортировка: sort=priceAsc|priceDesc|yearDesc|yearAsc|mileageAsc|mileageDesc. limit/offset — для главной (например limit=8).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CarListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CarListItemDto>>> GetList(
        [FromQuery] int? brandId,
        [FromQuery] int? modelId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? yearFrom,
        [FromQuery] int? yearTo,
        [FromQuery] int? minMileage,
        [FromQuery] int? maxMileage,
        [FromQuery] string? gearbox,
        [FromQuery] string? driveType,
        [FromQuery] string? bodyType,
        [FromQuery] string? sort,
        [FromQuery] int? limit,
        [FromQuery] int? offset,
        CancellationToken cancellationToken)
    {
        IQueryable<Car> query = _db.Cars
            .AsNoTracking()
            .Where(c => c.Status == "Active")
            .Include(c => c.Brand)
            .Include(c => c.Model);

        if (brandId.HasValue) query = query.Where(c => c.BrandId == brandId.Value);
        if (modelId.HasValue) query = query.Where(c => c.ModelId == modelId.Value);
        if (minPrice.HasValue) query = query.Where(c => c.Price >= minPrice.Value);
        if (maxPrice.HasValue) query = query.Where(c => c.Price <= maxPrice.Value);
        if (yearFrom.HasValue) query = query.Where(c => c.Year >= yearFrom.Value);
        if (yearTo.HasValue) query = query.Where(c => c.Year <= yearTo.Value);
        if (minMileage.HasValue) query = query.Where(c => c.Mileage >= minMileage.Value);
        if (maxMileage.HasValue) query = query.Where(c => c.Mileage <= maxMileage.Value);
        if (!string.IsNullOrWhiteSpace(gearbox)) query = query.Where(c => c.Gearbox == gearbox);
        if (!string.IsNullOrWhiteSpace(driveType)) query = query.Where(c => c.DriveType == driveType);
        if (!string.IsNullOrWhiteSpace(bodyType)) query = query.Where(c => c.BodyType == bodyType);

        query = (sort?.ToLowerInvariant()) switch
        {
            "priceasc" => query.OrderBy(c => c.Price),
            "pricedesc" => query.OrderByDescending(c => c.Price),
            "yeardesc" => query.OrderByDescending(c => c.Year),
            "yearasc" => query.OrderBy(c => c.Year),
            "mileageasc" => query.OrderBy(c => c.Mileage),
            "mileagedesc" => query.OrderByDescending(c => c.Mileage),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        if (offset.HasValue && offset.Value > 0)
            query = query.Skip(offset.Value);
        if (limit.HasValue && limit.Value > 0)
            query = query.Take(limit.Value);

        var list = await query
            .Select(c => new CarListItemDto
            {
                Id = c.Id,
                BrandName = c.Brand.Name,
                ModelName = c.Model.Name,
                Year = c.Year,
                Mileage = c.Mileage,
                Gearbox = c.Gearbox,
                DriveType = c.DriveType,
                BodyType = c.BodyType,
                Price = c.Price,
                HasPhoto = c.Photos.Any(),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    /// <summary>
    /// Создать объявление. Требуется авторизация. Фото — массив { dataBase64, mimeType }.
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(CarListItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CarListItemDto>> Create([FromBody] CreateCarRequest request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var brandExists = await _db.Brands.AnyAsync(b => b.Id == request.BrandId, cancellationToken);
        if (!brandExists)
            return BadRequest(new { message = "Марка не найдена" });

        var modelExists = await _db.Models.AnyAsync(m => m.Id == request.ModelId && m.BrandId == request.BrandId, cancellationToken);
        if (!modelExists)
            return BadRequest(new { message = "Модель не найдена или не принадлежит выбранной марке" });

        if (request.Photos == null || request.Photos.Count == 0)
            return BadRequest(new { message = "Загрузите хотя бы одно фото" });

        var car = new Car
        {
            BrandId = request.BrandId,
            ModelId = request.ModelId,
            Year = request.Year,
            Mileage = request.Mileage,
            Gearbox = request.Gearbox,
            DriveType = request.DriveType,
            BodyType = request.BodyType,
            Engine = request.Engine,
            Price = request.Price,
            Description = request.Description,
            SellerId = userId,
            Status = "Active"
        };
        _db.Cars.Add(car);
        await _db.SaveChangesAsync(cancellationToken);

        int order = 0;
        foreach (var p in request.Photos)
        {
            byte[] content;
            try
            {
                var base64 = p.DataBase64.Trim();
                if (base64.Contains(",")) base64 = base64.Split(',')[1];
                content = Convert.FromBase64String(base64);
            }
            catch
            {
                continue;
            }
            if (content.Length == 0) continue;
            var mime = string.IsNullOrWhiteSpace(p.MimeType) ? "image/jpeg" : p.MimeType;
            _db.CarPhotos.Add(new CarPhoto { CarId = car.Id, Content = content, MimeType = mime, Order = order++ });
        }
        await _db.SaveChangesAsync(cancellationToken);

        var created = await _db.Cars
            .AsNoTracking()
            .Where(c => c.Id == car.Id)
            .Select(c => new CarListItemDto
            {
                Id = c.Id,
                BrandName = c.Brand.Name,
                ModelName = c.Model.Name,
                Year = c.Year,
                Mileage = c.Mileage,
                Gearbox = c.Gearbox,
                DriveType = c.DriveType,
                BodyType = c.BodyType,
                Price = c.Price,
                HasPhoto = c.Photos.Any(),
                CreatedAt = c.CreatedAt
            })
            .FirstAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = car.Id }, created);
    }

    /// <summary>
    /// Объявления текущего пользователя (для профиля). Требуется авторизация.
    /// </summary>
    [HttpGet("my")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<CarListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CarListItemDto>>> GetMy(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var list = await _db.Cars
            .AsNoTracking()
            .Where(c => c.SellerId == userId)
            .Include(c => c.Brand)
            .Include(c => c.Model)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CarListItemDto
            {
                Id = c.Id,
                BrandName = c.Brand.Name,
                ModelName = c.Model.Name,
                Year = c.Year,
                Mileage = c.Mileage,
                Gearbox = c.Gearbox,
                DriveType = c.DriveType,
                BodyType = c.BodyType,
                Price = c.Price,
                HasPhoto = c.Photos.Any(),
                CreatedAt = c.CreatedAt,
                Status = c.Status
            })
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    /// <summary>
    /// Карточка автомобиля по id. Контакты продавца в ответе.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CarDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CarDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var car = await _db.Cars
            .AsNoTracking()
            .Where(c => c.Id == id && c.Status == "Active")
            .Select(c => new
            {
                c.Id,
                c.BrandId,
                BrandName = c.Brand.Name,
                c.ModelId,
                ModelName = c.Model.Name,
                c.Year,
                c.Mileage,
                c.Gearbox,
                c.DriveType,
                c.BodyType,
                c.Engine,
                c.Price,
                c.Description,
                PhotoCount = c.Photos.Count,
                c.Seller,
                c.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (car == null)
            return NotFound();

        return Ok(new CarDetailDto
        {
            Id = car.Id,
            BrandId = car.BrandId,
            BrandName = car.BrandName,
            ModelId = car.ModelId,
            ModelName = car.ModelName,
            Year = car.Year,
            Mileage = car.Mileage,
            Gearbox = car.Gearbox,
            DriveType = car.DriveType,
            BodyType = car.BodyType,
            Engine = car.Engine,
            Price = car.Price,
            Description = car.Description,
            PhotoCount = car.PhotoCount,
            Seller = new SellerDto
            {
                Id = car.Seller.Id,
                FullName = car.Seller.FullName,
                PhoneNumber = car.Seller.PhoneNumber,
                Email = car.Seller.Email
            },
            CreatedAt = car.CreatedAt
        });
    }

    /// <summary>
    /// Фото автомобиля по индексу (0, 1, 2... по порядку). Возвращает binary image.
    /// </summary>
    [HttpGet("{id:int}/photos/{index:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPhoto(int id, int index, CancellationToken cancellationToken)
    {
        var photo = await _db.CarPhotos
            .AsNoTracking()
            .Where(p => p.CarId == id)
            .OrderBy(p => p.Order)
            .Skip(index)
            .Take(1)
            .FirstOrDefaultAsync(cancellationToken);

        if (photo == null)
            return NotFound();

        return File(photo.Content, photo.MimeType);
    }

    /// <summary>
    /// Удалить объявление. Доступно только владельцу объявления.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var car = await _db.Cars.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (car == null)
            return NotFound(new { message = "Объявление не найдено" });
        if (car.SellerId != userId)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Нельзя удалить чужое объявление" });

        _db.Cars.Remove(car);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
