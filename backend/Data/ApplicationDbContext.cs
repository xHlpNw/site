using AutoSeller.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AutoSeller.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Model> Models => Set<Model>();
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<CarPhoto> CarPhotos => Set<CarPhoto>();
    public DbSet<Comparison> Comparisons => Set<Comparison>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Comparison>()
            .HasKey(c => new { c.UserId, c.CarId });

        builder.Entity<Comparison>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comparisons)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Comparison>()
            .HasOne(c => c.Car)
            .WithMany()
            .HasForeignKey(c => c.CarId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Car>()
            .HasOne(c => c.Seller)
            .WithMany(u => u.Cars)
            .HasForeignKey(c => c.SellerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
