using BaseCore.DTO.Product;
using BaseCore.DTO.Product.BaseCore.DTO.Product;
using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Services
{
    public interface IProductService
    {
    Task<ProductDetailResponse?> GetProductDetail(int id);
    }
    public class ProductService : IProductService
    {
        private readonly MySqlDbContext _context;
        private readonly IProductRepositoryEF _productRepository;
        public ProductService(MySqlDbContext context)
        {
            _context = context;
        }
        public ProductService(IProductRepositoryEF productRepository)
        {
            _productRepository = productRepository;
        }
        public async Task<List<Product>> GetAllProductsAsync()
        {
            return await _context.Products.ToListAsync(); // ❌ bỏ Include
        }

        public async Task<Product> GetProductByIdAsync(int id)
        {
            return await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            var maxId = await _context.Products.MaxAsync(p => (int?)p.Id) ?? 0;
            product.Id = maxId + 1;

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task UpdateProductAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(string keyword, int? productTypeId, int page, int pageSize)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(keyword)
                );
            }

            if (productTypeId.HasValue)
            {
                query = query.Where(p => p.ProductTypeId == productTypeId.Value);
            }

            var totalCount = await query.CountAsync();

            var products = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }
        public async Task<(List<ProductDashboardResponse> Items, int TotalCount)> GetDashboardProducts(
        int page,
        int pageSize,
        string search,
        int? productTypeId)
        {
            return await _productRepository.GetDashboardProductsAsync(
                page,
                pageSize,
                search,
                productTypeId);
        }
        public async Task<ProductDetailResponse?> GetProductDetail(int id)
        {
            var product =
                await _productRepository.GetFullDetailAsync(id);

            if (product == null)
                return null;

            return new ProductDetailResponse
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Quantity = product.Quantity,
                Image = product.Image,
                Description = product.Description,
                Detail = product.Detail,
                ProductTypeId = product.ProductTypeId,
                ProductTypeName = product.ProductType.Name,

                Variants = product.ProductDetails
                    .Select(v => new ProductVariantResponse
                    {
                        Id = v.Id,
                        Brand = v.Brand,
                        Color = v.Color,
                        Size = v.Size,
                        Quantity = v.Quantity
                    })
                    .ToList()
            };
        }

    }
}