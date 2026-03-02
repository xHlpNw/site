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
public class ComparisonController : ControllerBase
{
    private const int MaxComparisonItems = 5;
    private readonly ApplicationDbContext _db;

    public ComparisonController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    /// <summary>
    /// Список автомобилей в сравнении текущего пользователя (те же данные, что в каталоге).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CarListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CarListItemDto>>> GetList(CancellationToken cancellationToken)
    {
        var userId = UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var list = await _db.Comparisons
            .AsNoTracking()
            .Where(c => c.UserId == userId && c.Car.Status == "Active")
            .OrderBy(c => c.AddedAt)
            .Select(c => new CarListItemDto
            {
                Id = c.Car.Id,
                BrandName = c.Car.Brand.Name,
                ModelName = c.Car.Model.Name,
                Year = c.Car.Year,
                Mileage = c.Car.Mileage,
                Gearbox = c.Car.Gearbox,
                DriveType = c.Car.DriveType,
                BodyType = c.Car.BodyType,
                Price = c.Car.Price,
                HasPhoto = c.Car.Photos.Any(),
                PhotoCount = c.Car.Photos.Count,
                CreatedAt = c.Car.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    /// <summary>
    /// Добавить автомобиль в сравнение. Лимит — 5 позиций. Body: { "carId": number }.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Add([FromBody] AddComparisonRequest request, CancellationToken cancellationToken)
    {
        var userId = UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var count = await _db.Comparisons.CountAsync(c => c.UserId == userId, cancellationToken);
        if (count >= MaxComparisonItems)
            return BadRequest(new { message = $"В сравнении не более {MaxComparisonItems} автомобилей. Удалите один из текущих." });

        var exists = await _db.Comparisons
            .AnyAsync(c => c.UserId == userId && c.CarId == request.CarId, cancellationToken);
        if (exists)
            return BadRequest(new { message = "Этот автомобиль уже добавлен в сравнение" });

        var carExists = await _db.Cars
            .AnyAsync(c => c.Id == request.CarId && c.Status == "Active", cancellationToken);
        if (!carExists)
            return NotFound(new { message = "Объявление не найдено или снято с публикации" });

        _db.Comparisons.Add(new Comparison { UserId = userId, CarId = request.CarId });
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetList), null);
    }

    /// <summary>
    /// Удалить автомобиль из сравнения.
    /// </summary>
    [HttpDelete("{carId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Remove(int carId, CancellationToken cancellationToken)
    {
        var userId = UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = await _db.Comparisons
            .FirstOrDefaultAsync(c => c.UserId == userId && c.CarId == carId, cancellationToken);
        if (item == null)
            return NotFound(new { message = "Автомобиль не найден в вашем сравнении" });

        _db.Comparisons.Remove(item);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}

public class AddComparisonRequest
{
    public int CarId { get; set; }
}
