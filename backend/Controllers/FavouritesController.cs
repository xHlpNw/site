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
[Authorize]
public class FavouritesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public FavouritesController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    /// <summary>
    /// Список автомобилей в избранном текущего пользователя (те же данные, что в каталоге).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CarListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CarListItemDto>>> GetList(CancellationToken cancellationToken)
    {
        var userId = UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var list = await _db.Favourites
            .AsNoTracking()
            .Where(f => f.UserId == userId && f.Car.Status == "Active")
            .OrderByDescending(f => f.AddedAt)
            .Select(f => new CarListItemDto
            {
                Id = f.Car.Id,
                BrandName = f.Car.Brand.Name,
                ModelName = f.Car.Model.Name,
                Year = f.Car.Year,
                Mileage = f.Car.Mileage,
                Gearbox = f.Car.Gearbox,
                DriveType = f.Car.DriveType,
                BodyType = f.Car.BodyType,
                Price = f.Car.Price,
                HasPhoto = f.Car.Photos.Any(),
                CreatedAt = f.Car.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    /// <summary>
    /// Добавить автомобиль в избранное. Body: { "carId": number }.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Add([FromBody] AddFavouriteRequest request, CancellationToken cancellationToken)
    {
        var userId = UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var exists = await _db.Favourites
            .AnyAsync(f => f.UserId == userId && f.CarId == request.CarId, cancellationToken);
        if (exists)
            return BadRequest(new { message = "Этот автомобиль уже в избранном" });

        var car = await _db.Cars
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.CarId && c.Status == "Active", cancellationToken);
        if (car == null)
            return NotFound(new { message = "Объявление не найдено или снято с публикации" });
        if (car.SellerId == userId)
            return BadRequest(new { message = "Нельзя добавить в избранное свой автомобиль" });

        _db.Favourites.Add(new Favourite { UserId = userId, CarId = request.CarId });
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetList), null);
    }

    /// <summary>
    /// Удалить автомобиль из избранного.
    /// </summary>
    [HttpDelete("{carId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Remove(int carId, CancellationToken cancellationToken)
    {
        var userId = UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = await _db.Favourites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.CarId == carId, cancellationToken);
        if (item == null)
            return NotFound(new { message = "Автомобиль не найден в избранном" });

        _db.Favourites.Remove(item);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}

public class AddFavouriteRequest
{
    public int CarId { get; set; }
}
