using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository
{
    /// <summary>
    /// Entity Framework Core DbContext for MySQL
    /// Used for teaching EF Core concepts (Bài 10)
    /// </summary>
    public class MySqlDbContext : DbContext
    {
        public MySqlDbContext(DbContextOptions<MySqlDbContext> options) : base(options)
        {
        }

        // DbSet for each entity
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductDetail> ProductDetails { get; set; }
        public DbSet<ProductType> ProductTypes { get; set; }
        public DbSet<Bill> Bills { get; set; }
        public DbSet<BillDetail> BillDetails { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Username)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.Password)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(e => e.FullName)
                    .HasMaxLength(100);

                entity.Property(e => e.Email)
                    .HasMaxLength(100);

                entity.Property(e => e.Phone)
                    .HasMaxLength(20);

                entity.Property(e => e.Address)
                    .HasMaxLength(200);

                entity.Property(e => e.Role)
                    .HasMaxLength(20);

                entity.Property(e => e.CreatedAt);

                entity.HasIndex(e => e.Username).IsUnique();
            });

            // Configure ProductType entity
            modelBuilder.Entity<ProductType>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            // Configure Product entity
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Price).HasPrecision(18, 2);

                entity.Property(e => e.Image).HasMaxLength(500);
            });

            // Configure Order entity
            modelBuilder.Entity<Bill>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
                entity.Property(e => e.ShippingAddress).HasMaxLength(500);
            });

            // Configure OrderDetail entity
            modelBuilder.Entity<BillDetail>()
        .HasOne(bd => bd.Bill)
        .WithMany(b => b.BillDetails)
        .HasForeignKey(bd => bd.BillId);

            modelBuilder.Entity<BillDetail>()
                .HasOne(bd => bd.Product)
                .WithMany(p => p.BillDetails)
                .HasForeignKey(bd => bd.ProductId);

            modelBuilder.Entity<BillDetail>()
                .HasOne(bd => bd.ProductDetail)
                .WithMany(pd => pd.BillDetails)
                .HasForeignKey(bd => bd.ProductDetailId);

            // Seed initial data
            SeedData(modelBuilder);
        }


        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Categories
            //modelBuilder.Entity<Category>().HasData(
                //new Category { Id = 1, Name = "Electronics", Description = "Electronic devices and gadgets" },
                //new Category { Id = 2, Name = "Clothing", Description = "Apparel and fashion items" },
                //new Category { Id = 3, Name = "Books", Description = "Books and publications" },
                //new Category { Id = 4, Name = "Home & Garden", Description = "Home and garden products" },
                //new Category { Id = 5, Name = "Sports", Description = "Sports equipment and accessories" }
            //);

            // Seed Products
            //modelBuilder.Entity<Product>().HasData(
                //new Product { Id = 1, Name = "Laptop Dell XPS 15", Price = 35000000, Stock = 10, CategoryId = 1, Description = "High-performance laptop", ImageUrl = "" },
                //new Product { Id = 2, Name = "iPhone 15 Pro", Price = 28000000, Stock = 15, CategoryId = 1, Description = "Latest Apple smartphone", ImageUrl = "" },
                //new Product { Id = 3, Name = "T-Shirt Cotton", Price = 250000, Stock = 100, CategoryId = 2, Description = "Comfortable cotton t-shirt", ImageUrl = "" },
                //new Product { Id = 4, Name = "Programming Book", Price = 450000, Stock = 50, CategoryId = 3, Description = "Learn programming basics", ImageUrl = "" },
                //new Product { Id = 5, Name = "Garden Tools Set", Price = 850000, Stock = 25, CategoryId = 4, Description = "Complete gardening toolkit", ImageUrl = "" }
            //);

            // Note: Users are managed by AuthService (MongoDB)
            // User seed data is handled by MongoDbContext.SeedDataAsync()
        }
    }
}
