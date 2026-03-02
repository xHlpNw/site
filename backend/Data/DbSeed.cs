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
            new Brand { Id = 3, Name = "Audi" },
            new Brand { Id = 4, Name = "Mercedes-Benz" },
            new Brand { Id = 5, Name = "Volkswagen" },
            new Brand { Id = 6, Name = "Hyundai" },
            new Brand { Id = 7, Name = "Kia" },
            new Brand { Id = 8, Name = "Nissan" },
            new Brand { Id = 9, Name = "Honda" },
            new Brand { Id = 10, Name = "Mazda" },
            new Brand { Id = 11, Name = "Ford" },
            new Brand { Id = 12, Name = "Skoda" },
            new Brand { Id = 13, Name = "Volvo" },
            new Brand { Id = 14, Name = "Lexus" },
            new Brand { Id = 15, Name = "Renault" },
            new Brand { Id = 16, Name = "Chevrolet" },
            new Brand { Id = 17, Name = "Lada" },
            new Brand { Id = 18, Name = "Subaru" },
            new Brand { Id = 19, Name = "Mitsubishi" },
            new Brand { Id = 20, Name = "Porsche" }
        };

        db.Brands.AddRange(brands);

        var models = new[]
        {
            // Toyota (1)
            new Model { Id = 1, BrandId = 1, Name = "Camry" },
            new Model { Id = 2, BrandId = 1, Name = "Corolla" },
            new Model { Id = 3, BrandId = 1, Name = "RAV4" },
            new Model { Id = 4, BrandId = 1, Name = "Land Cruiser" },
            new Model { Id = 5, BrandId = 1, Name = "Highlander" },
            new Model { Id = 6, BrandId = 1, Name = "Yaris" },
            new Model { Id = 7, BrandId = 1, Name = "Prado" },
            new Model { Id = 8, BrandId = 1, Name = "Crown" },
            new Model { Id = 9, BrandId = 1, Name = "Hilux" },
            // BMW (2)
            new Model { Id = 10, BrandId = 2, Name = "3 Series" },
            new Model { Id = 11, BrandId = 2, Name = "5 Series" },
            new Model { Id = 12, BrandId = 2, Name = "X5" },
            new Model { Id = 13, BrandId = 2, Name = "X3" },
            new Model { Id = 14, BrandId = 2, Name = "X1" },
            new Model { Id = 15, BrandId = 2, Name = "7 Series" },
            new Model { Id = 16, BrandId = 2, Name = "1 Series" },
            new Model { Id = 17, BrandId = 2, Name = "X7" },
            new Model { Id = 18, BrandId = 2, Name = "M3" },
            // Audi (3)
            new Model { Id = 19, BrandId = 3, Name = "A3" },
            new Model { Id = 20, BrandId = 3, Name = "A4" },
            new Model { Id = 21, BrandId = 3, Name = "A6" },
            new Model { Id = 22, BrandId = 3, Name = "A5" },
            new Model { Id = 23, BrandId = 3, Name = "Q5" },
            new Model { Id = 24, BrandId = 3, Name = "Q7" },
            new Model { Id = 25, BrandId = 3, Name = "A1" },
            new Model { Id = 26, BrandId = 3, Name = "Q3" },
            new Model { Id = 27, BrandId = 3, Name = "A7" },
            // Mercedes-Benz (4)
            new Model { Id = 28, BrandId = 4, Name = "C-Class" },
            new Model { Id = 29, BrandId = 4, Name = "E-Class" },
            new Model { Id = 30, BrandId = 4, Name = "S-Class" },
            new Model { Id = 31, BrandId = 4, Name = "GLC" },
            new Model { Id = 32, BrandId = 4, Name = "GLE" },
            new Model { Id = 33, BrandId = 4, Name = "A-Class" },
            new Model { Id = 34, BrandId = 4, Name = "GLA" },
            new Model { Id = 35, BrandId = 4, Name = "CLA" },
            new Model { Id = 36, BrandId = 4, Name = "GLB" },
            // Volkswagen (5)
            new Model { Id = 37, BrandId = 5, Name = "Golf" },
            new Model { Id = 38, BrandId = 5, Name = "Passat" },
            new Model { Id = 39, BrandId = 5, Name = "Polo" },
            new Model { Id = 40, BrandId = 5, Name = "Tiguan" },
            new Model { Id = 41, BrandId = 5, Name = "Touareg" },
            new Model { Id = 42, BrandId = 5, Name = "Jetta" },
            new Model { Id = 43, BrandId = 5, Name = "T-Roc" },
            new Model { Id = 44, BrandId = 5, Name = "Arteon" },
            new Model { Id = 45, BrandId = 5, Name = "Caddy" },
            // Hyundai (6)
            new Model { Id = 46, BrandId = 6, Name = "Solaris" },
            new Model { Id = 47, BrandId = 6, Name = "Elantra" },
            new Model { Id = 48, BrandId = 6, Name = "Tucson" },
            new Model { Id = 49, BrandId = 6, Name = "Santa Fe" },
            new Model { Id = 50, BrandId = 6, Name = "Creta" },
            new Model { Id = 51, BrandId = 6, Name = "Kona" },
            new Model { Id = 52, BrandId = 6, Name = "Sonata" },
            new Model { Id = 53, BrandId = 6, Name = "Palisade" },
            new Model { Id = 54, BrandId = 6, Name = "i30" },
            // Kia (7)
            new Model { Id = 55, BrandId = 7, Name = "Rio" },
            new Model { Id = 56, BrandId = 7, Name = "Optima" },
            new Model { Id = 57, BrandId = 7, Name = "Sportage" },
            new Model { Id = 58, BrandId = 7, Name = "Sorento" },
            new Model { Id = 59, BrandId = 7, Name = "K5" },
            new Model { Id = 60, BrandId = 7, Name = "Seltos" },
            new Model { Id = 61, BrandId = 7, Name = "Stinger" },
            new Model { Id = 62, BrandId = 7, Name = "Ceed" },
            new Model { Id = 63, BrandId = 7, Name = "Carnival" },
            // Nissan (8)
            new Model { Id = 64, BrandId = 8, Name = "Qashqai" },
            new Model { Id = 65, BrandId = 8, Name = "X-Trail" },
            new Model { Id = 66, BrandId = 8, Name = "Murano" },
            new Model { Id = 67, BrandId = 8, Name = "Juke" },
            new Model { Id = 68, BrandId = 8, Name = "Leaf" },
            new Model { Id = 69, BrandId = 8, Name = "Patrol" },
            new Model { Id = 70, BrandId = 8, Name = "Tiida" },
            new Model { Id = 71, BrandId = 8, Name = "Note" },
            new Model { Id = 72, BrandId = 8, Name = "Navara" },
            // Honda (9)
            new Model { Id = 73, BrandId = 9, Name = "Civic" },
            new Model { Id = 74, BrandId = 9, Name = "Accord" },
            new Model { Id = 75, BrandId = 9, Name = "CR-V" },
            new Model { Id = 76, BrandId = 9, Name = "HR-V" },
            new Model { Id = 77, BrandId = 9, Name = "Pilot" },
            new Model { Id = 78, BrandId = 9, Name = "Jazz" },
            new Model { Id = 79, BrandId = 9, Name = "Fit" },
            new Model { Id = 80, BrandId = 9, Name = "City" },
            new Model { Id = 81, BrandId = 9, Name = "Odyssey" },
            // Mazda (10)
            new Model { Id = 82, BrandId = 10, Name = "3" },
            new Model { Id = 83, BrandId = 10, Name = "6" },
            new Model { Id = 84, BrandId = 10, Name = "CX-5" },
            new Model { Id = 85, BrandId = 10, Name = "CX-30" },
            new Model { Id = 86, BrandId = 10, Name = "CX-60" },
            new Model { Id = 87, BrandId = 10, Name = "CX-3" },
            new Model { Id = 88, BrandId = 10, Name = "2" },
            new Model { Id = 89, BrandId = 10, Name = "CX-9" },
            new Model { Id = 90, BrandId = 10, Name = "MX-5" },
            // Ford (11)
            new Model { Id = 91, BrandId = 11, Name = "Focus" },
            new Model { Id = 92, BrandId = 11, Name = "Mondeo" },
            new Model { Id = 93, BrandId = 11, Name = "Kuga" },
            new Model { Id = 94, BrandId = 11, Name = "Explorer" },
            new Model { Id = 95, BrandId = 11, Name = "Fiesta" },
            new Model { Id = 96, BrandId = 11, Name = "Mustang" },
            new Model { Id = 97, BrandId = 11, Name = "Puma" },
            new Model { Id = 98, BrandId = 11, Name = "Ranger" },
            new Model { Id = 99, BrandId = 11, Name = "Escape" },
            // Skoda (12)
            new Model { Id = 100, BrandId = 12, Name = "Octavia" },
            new Model { Id = 101, BrandId = 12, Name = "Superb" },
            new Model { Id = 102, BrandId = 12, Name = "Kodiaq" },
            new Model { Id = 103, BrandId = 12, Name = "Karoq" },
            new Model { Id = 104, BrandId = 12, Name = "Rapid" },
            new Model { Id = 105, BrandId = 12, Name = "Fabia" },
            new Model { Id = 106, BrandId = 12, Name = "Kamiq" },
            new Model { Id = 107, BrandId = 12, Name = "Enyaq" },
            new Model { Id = 108, BrandId = 12, Name = "Scala" },
            // Volvo (13)
            new Model { Id = 109, BrandId = 13, Name = "XC60" },
            new Model { Id = 110, BrandId = 13, Name = "XC90" },
            new Model { Id = 111, BrandId = 13, Name = "S60" },
            new Model { Id = 112, BrandId = 13, Name = "S90" },
            new Model { Id = 113, BrandId = 13, Name = "V60" },
            new Model { Id = 114, BrandId = 13, Name = "XC40" },
            new Model { Id = 115, BrandId = 13, Name = "V90" },
            new Model { Id = 116, BrandId = 13, Name = "C40" },
            new Model { Id = 117, BrandId = 13, Name = "EX90" },
            // Lexus (14)
            new Model { Id = 118, BrandId = 14, Name = "ES" },
            new Model { Id = 119, BrandId = 14, Name = "RX" },
            new Model { Id = 120, BrandId = 14, Name = "NX" },
            new Model { Id = 121, BrandId = 14, Name = "IS" },
            new Model { Id = 122, BrandId = 14, Name = "LX" },
            new Model { Id = 123, BrandId = 14, Name = "GX" },
            new Model { Id = 124, BrandId = 14, Name = "UX" },
            new Model { Id = 125, BrandId = 14, Name = "LS" },
            new Model { Id = 126, BrandId = 14, Name = "LC" },
            // Renault (15)
            new Model { Id = 127, BrandId = 15, Name = "Logan" },
            new Model { Id = 128, BrandId = 15, Name = "Sandero" },
            new Model { Id = 129, BrandId = 15, Name = "Duster" },
            new Model { Id = 130, BrandId = 15, Name = "Kaptur" },
            new Model { Id = 131, BrandId = 15, Name = "Arkana" },
            new Model { Id = 132, BrandId = 15, Name = "Megane" },
            new Model { Id = 133, BrandId = 15, Name = "Clio" },
            new Model { Id = 134, BrandId = 15, Name = "Koleos" },
            new Model { Id = 135, BrandId = 15, Name = "Austral" },
            // Chevrolet (16)
            new Model { Id = 136, BrandId = 16, Name = "Cruze" },
            new Model { Id = 137, BrandId = 16, Name = "Aveo" },
            new Model { Id = 138, BrandId = 16, Name = "Trailblazer" },
            new Model { Id = 139, BrandId = 16, Name = "Tahoe" },
            new Model { Id = 140, BrandId = 16, Name = "Captiva" },
            new Model { Id = 141, BrandId = 16, Name = "Orlando" },
            new Model { Id = 142, BrandId = 16, Name = "Niva" },
            new Model { Id = 143, BrandId = 16, Name = "Camaro" },
            new Model { Id = 144, BrandId = 16, Name = "Equinox" },
            // Lada (17)
            new Model { Id = 145, BrandId = 17, Name = "Vesta" },
            new Model { Id = 146, BrandId = 17, Name = "Granta" },
            new Model { Id = 147, BrandId = 17, Name = "XRAY" },
            new Model { Id = 148, BrandId = 17, Name = "Largus" },
            new Model { Id = 149, BrandId = 17, Name = "Niva" },
            new Model { Id = 150, BrandId = 17, Name = "2107" },
            new Model { Id = 151, BrandId = 17, Name = "Priora" },
            new Model { Id = 152, BrandId = 17, Name = "4x4" },
            new Model { Id = 153, BrandId = 17, Name = "Niva Travel" },
            // Subaru (18)
            new Model { Id = 154, BrandId = 18, Name = "Outback" },
            new Model { Id = 155, BrandId = 18, Name = "Forester" },
            new Model { Id = 156, BrandId = 18, Name = "Impreza" },
            new Model { Id = 157, BrandId = 18, Name = "XV" },
            new Model { Id = 158, BrandId = 18, Name = "Legacy" },
            new Model { Id = 159, BrandId = 18, Name = "WRX" },
            new Model { Id = 160, BrandId = 18, Name = "BRZ" },
            new Model { Id = 161, BrandId = 18, Name = "Crosstrek" },
            new Model { Id = 162, BrandId = 18, Name = "Ascent" },
            // Mitsubishi (19)
            new Model { Id = 163, BrandId = 19, Name = "Outlander" },
            new Model { Id = 164, BrandId = 19, Name = "Pajero" },
            new Model { Id = 165, BrandId = 19, Name = "L200" },
            new Model { Id = 166, BrandId = 19, Name = "Lancer" },
            new Model { Id = 167, BrandId = 19, Name = "ASX" },
            new Model { Id = 168, BrandId = 19, Name = "Eclipse Cross" },
            new Model { Id = 169, BrandId = 19, Name = "Pajero Sport" },
            new Model { Id = 170, BrandId = 19, Name = "Colt" },
            new Model { Id = 171, BrandId = 19, Name = "Xpander" },
            // Porsche (20)
            new Model { Id = 172, BrandId = 20, Name = "Cayenne" },
            new Model { Id = 173, BrandId = 20, Name = "Macan" },
            new Model { Id = 174, BrandId = 20, Name = "911" },
            new Model { Id = 175, BrandId = 20, Name = "Panamera" },
            new Model { Id = 176, BrandId = 20, Name = "Cayman" },
            new Model { Id = 177, BrandId = 20, Name = "Boxster" },
            new Model { Id = 178, BrandId = 20, Name = "Taycan" },
            new Model { Id = 179, BrandId = 20, Name = "Carrera" },
            new Model { Id = 180, BrandId = 20, Name = "Taycan Cross Turismo" }
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
