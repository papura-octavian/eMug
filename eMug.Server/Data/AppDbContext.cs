using eMug.Server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace eMug.Server.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Supplier> Suppliers => Set<Supplier>();
        public DbSet<DeliveryMethod> DeliveryMethods => Set<DeliveryMethod>();
        public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
            builder.Entity<DeliveryMethod>().Property(d => d.Price).HasPrecision(18, 2);

            builder.Entity<WishlistItem>()
                .HasIndex(w => new { w.UserId, w.ProductId })
                .IsUnique();

            builder.Entity<Order>(o =>
            {
                o.Property(x => x.DeliveryPrice).HasPrecision(18, 2);
                o.Property(x => x.Subtotal).HasPrecision(18, 2);
                o.Property(x => x.Total).HasPrecision(18, 2);
                o.HasOne(x => x.DeliveryMethod)
                    .WithMany()
                    .OnDelete(DeleteBehavior.SetNull);
            });

            builder.Entity<OrderItem>(i =>
            {
                i.Property(x => x.UnitPrice).HasPrecision(18, 2);
                i.HasOne(x => x.Product)
                    .WithMany()
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}