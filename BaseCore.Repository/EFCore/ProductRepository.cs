using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    public interface IProductRepositoryEF : IRepository<Product>
    {
        Task<(List<Product> Products, int TotalCount)> SearchAsync(
    string? keyword,
    int? productTypeId,
    decimal? minPrice,
    decimal? maxPrice,
    int page,
    int pageSize);
        Task<List<Product>> GetByProductTypeAsync(int productTypeId);
    }

    public class ProductRepositoryEF : Repository<Product>, IProductRepositoryEF
    {
        public ProductRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(
        string? keyword,
        int? productTypeId,
        decimal? minPrice,
        decimal? maxPrice,
        int page,
         int pageSize)
        {
            var query = _dbSet.AsQueryable();

            // 🔍 tìm theo tên
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(keyword));
            }

            // 📂 lọc theo loại
            if (productTypeId.HasValue && productTypeId > 0)
            {
                query = query.Where(p => p.ProductTypeId == productTypeId.Value);
            }

            // 💰 lọc theo giá
            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            // 📊 tổng số bản ghi
            var totalCount = await query.CountAsync();

            // 📄 phân trang
            var products = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<List<Product>> GetByProductTypeAsync(int productTypeId)
        {
            return await _dbSet
                .Where(p => p.ProductTypeId == productTypeId)
                .ToListAsync();
        }
    }
}