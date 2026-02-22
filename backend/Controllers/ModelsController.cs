using AutoSeller.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSeller.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ModelsController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Список моделей. Опционально фильтр по марке: ?brandId=1
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ModelDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ModelDto>>> GetAll([FromQuery] int? brandId, CancellationToken cancellationToken)
    {
        var query = _db.Models.AsQueryable();
        if (brandId.HasValue)
            query = query.Where(m => m.BrandId == brandId.Value);

        var list = await query
            .OrderBy(m => m.BrandId)
            .ThenBy(m => m.Name)
            .Select(m => new ModelDto { Id = m.Id, Name = m.Name, BrandId = m.BrandId })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }
}

public class ModelDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int BrandId { get; set; }
}
