using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    public interface IProductRepositoryEF : IRepository<Product>
    {
        Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? productTypeId, int page, int pageSize);
        Task<List<Product>> GetByProductTypeAsync(int productTypeId);
    }

    public class ProductRepositoryEF : Repository<Product>, IProductRepositoryEF
    {
        public ProductRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? productTypeId, int page, int pageSize)
        {
            var query = _dbSet.AsQueryable(); // ❌ bỏ Include

            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(keyword)
                );
            }

            if (productTypeId.HasValue && productTypeId > 0)
            {
                query = query.Where(p => p.ProductTypeId == productTypeId);
            }

            var totalCount = await query.CountAsync();

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