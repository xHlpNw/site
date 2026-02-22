using AutoSeller.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSeller.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public BrandsController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Список всех марок.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BrandDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BrandDto>>> GetAll(CancellationToken cancellationToken)
    {
        var list = await _db.Brands
            .OrderBy(b => b.Name)
            .Select(b => new BrandDto { Id = b.Id, Name = b.Name })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }
}

public class BrandDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
