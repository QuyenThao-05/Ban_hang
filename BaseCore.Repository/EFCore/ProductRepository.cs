using BaseCore.DTO.Product;
using BaseCore.DTO.Product.BaseCore.DTO.Product;
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
    int page,
    int pageSize);
        Task<Product?> GetFullDetailAsync(int id);
        Task<List<Product>> GetByProductTypeAsync(int productTypeId);
        Task<(List<ProductDashboardResponse> Items, int TotalCount)> GetDashboardProductsAsync(
    int page,
    int pageSize,
    string? search,
    int? productTypeId);
      
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

            // tìm theo tên
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(keyword));
            }

            //lọc theo loại
            if (productTypeId.HasValue && productTypeId > 0)
            {
                query = query.Where(p => p.ProductTypeId == productTypeId.Value);
            }

            // lọc theo giá
            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            // tổng số bản ghi
            var totalCount = await query.CountAsync();

            // phân trang
            var products = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }
        public async Task<Product?> GetFullDetailAsync(int id)
        {
            return await _dbSet
                .Include(p => p.ProductType)
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

            // 🔍 SEARCH
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();

                query = query.Where(p =>
                    p.Name.ToLower().Contains(search));
            }

            // 🎯 FILTER
            if (productTypeId.HasValue && productTypeId > 0)
            {
                query = query.Where(p =>
                    p.ProductTypeId == productTypeId.Value);
            }

            // 📊 TOTAL COUNT
            var totalCount = await query.CountAsync();

            // 📄 PAGINATION
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