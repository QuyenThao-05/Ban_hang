using BaseCore.DTO.Product;
using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;
namespace BaseCore.Repository.EFCore
{
    public interface IProductRepositoryEF : IRepository<Product>
    {
        Task<(List<Product> Products, int TotalCount)> SearchAsync(
    string? keyword,
    int? productTypeId,
    decimal? minPrice,
    decimal? maxPrice,
    int? stockMin,
    int? stockMax,
    int page,
    int pageSize);
        Task<Product?> GetFullDetailAsync(int id);
        Task<List<Product>> GetByProductTypeAsync(int productTypeId);
        Task<(List<ProductDashboardResponse> Items, int TotalCount)> GetDashboardProductsAsync(
    int page,
    int pageSize,
    string? keyword,
    int? productTypeId);
    }

    public class ProductRepositoryEF : Repository<Product>, IProductRepositoryEF
    {
        public ProductRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        // ✅ Override DeleteAsync — xóa các bảng liên quan trước
        public override async Task DeleteAsync(Product entity)
        {
            var id = entity.Id;

            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM Reviews WHERE ProductId = {0}", id);
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM CartItems WHERE ProductId = {0}", id);
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM OrderDetails WHERE ProductId = {0}", id);
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM ProductDetails WHERE ProductId = {0}", id);

            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }


        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(
        string? keyword,
        int? productTypeId,
        decimal? minPrice,
        decimal? maxPrice,
        int? stockMin,
        int? stockMax,
        int page,
        int pageSize)
        {
            var query = _dbSet
                .Include(p => p.ProductType)
                .Include(p => p.Manufacturer)
                .AsQueryable();
            Console.WriteLine($"stockMin={stockMin}, stockMax={stockMax}");

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(keyword));
            }

            if (productTypeId.HasValue && productTypeId > 0)
            {
                query = query.Where(p => p.ProductTypeId == productTypeId.Value);
            }

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);
            // Filter theo khoảng tồn kho
            if (stockMin.HasValue)
                query = query.Where(p => p.Quantity >= stockMin.Value);

            if (stockMax.HasValue)
                query = query.Where(p => p.Quantity <= stockMax.Value);

            var totalCount = await query.CountAsync();

            var products = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<Product?> GetFullDetailAsync(int id)
        {
            return await _context.Products

                .Include(p => p.ProductType)

                .Include(p => p.ProductVariants)

                .Include(p => p.Reviews)
                    .ThenInclude(r => r.User)

                .Include(p => p.ProductDetails)

                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Product>> GetByProductTypeAsync(int productTypeId)
        {
            return await _dbSet
                .Where(p => p.ProductTypeId == productTypeId)
                .ToListAsync();
        }

        public async Task<(List<ProductDashboardResponse> Items, int TotalCount)> GetDashboardProductsAsync(
    int page,
    int pageSize,
    string? search,
    int? productTypeId)
        {
            var query = _dbSet
                .Include(p => p.ProductType)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(search));
            }

            if (productTypeId.HasValue && productTypeId > 0)
                query = query.Where(p => p.ProductTypeId == productTypeId.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductDashboardResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    Image = p.Image,
                    ProductTypeId = p.ProductTypeId,
                    ProductTypeName = p.ProductType.Name
                })
                .ToListAsync();

            return (items, totalCount);
        }
    }
}