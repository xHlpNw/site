using AutoSeller.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoSeller.Api.Data;

public static class DbSeed
{
    public static async Task SeedBrandsAndModelsAsync(ApplicationDbContext db, CancellationToken ct = default)
    {
        if (await db.Brands.AnyAsync(ct))
            return;

        var brands = new[]
        {
            new Brand { Id = 1, Name = "Toyota" },
            new Brand { Id = 2, Name = "BMW" },
            new Brand { Id = 3, Name = "Audi" }
        };

        db.Brands.AddRange(brands);

        var models = new[]
        {
            new Model { Id = 1, BrandId = 1, Name = "Camry" },
            new Model { Id = 2, BrandId = 1, Name = "Corolla" },
            new Model { Id = 3, BrandId = 1, Name = "RAV4" },
            new Model { Id = 4, BrandId = 2, Name = "3 Series" },
            new Model { Id = 5, BrandId = 2, Name = "5 Series" },
            new Model { Id = 6, BrandId = 2, Name = "X5" },
            new Model { Id = 7, BrandId = 3, Name = "A3" },
            new Model { Id = 8, BrandId = 3, Name = "A4" },
            new Model { Id = 9, BrandId = 3, Name = "A6" }
        };

        db.Models.AddRange(models);
        await db.SaveChangesAsync(ct);

        // Обновить последовательности Id, чтобы следующие вставки не конфликтовали
        await db.Database.ExecuteSqlRawAsync(
            "SELECT setval(pg_get_serial_sequence('\"Brands\"', 'Id'), COALESCE((SELECT MAX(\"Id\") FROM \"Brands\"), 1));");
        await db.Database.ExecuteSqlRawAsync(
            "SELECT setval(pg_get_serial_sequence('\"Models\"', 'Id'), COALESCE((SELECT MAX(\"Id\") FROM \"Models\"), 1));");
    }
}
