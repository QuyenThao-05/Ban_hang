using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.DTO.Product;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Product API Controller
    /// Teaching: RESTful API, CRUD Operations, EF Core (Bài 10, 11)
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepositoryEF _productRepository;
        private readonly ICategoryRepositoryEF _categoryRepository;
      

        

        public ProductsController(IProductRepositoryEF productRepository, ICategoryRepositoryEF categoryRepository)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
        }

        /// <summary>
        /// Get all products with pagination and search
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
    [FromQuery] string? search,
    [FromQuery] int? productTypeId,
    [FromQuery] decimal? minPrice,
    [FromQuery] decimal? maxPrice,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;

            var (products, totalCount) = await _productRepository.SearchAsync(
                search,
                productTypeId,
                minPrice,
                maxPrice,
                page,
                pageSize);

            var result = products.Select(p => new
            {
                p.Id,
                p.Name,
                p.Price,
                p.Quantity,
                p.Image,
                p.ProductTypeId,
                ProductTypeName = p.ProductType != null ? p.ProductType.Name : "",
                p.CreatedAt,
                p.ManufacturerId
            });

            return Ok(new
            {
                items = result,
                totalCount,
                page,
                pageSize,
                totalPages = totalCount == 0 ? 1 :
                    (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }
        /// <summary>
        /// Get product by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });
            var result = new
            {
                product.Id,
                product.Name,
                product.Price,
                product.Quantity,
                product.Image,
                product.ProductTypeId,
                product.CreatedAt,
                product.ManufacturerId
            };
            return Ok(result);
        }

        /// <summary>
        /// Create new product (requires authentication)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            // Validate category exists
            var category = await _categoryRepository.GetByIdAsync(dto.ProductTypeId);
            if (category == null)
                return BadRequest(new { message = "Category not found" });

            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Quantity = dto.Quantity,
                ProductTypeId = dto.ProductTypeId,
                Image = dto.Image ?? "",
                ManufacturerId = dto.ManufacturerId,
                CreatedAt = DateTime.Now
            };

            await _productRepository.AddAsync(product);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        /// <summary>
        /// Update product (requires authentication)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            product.Name = dto.Name ?? product.Name;
            product.Price = dto.Price ?? product.Price;
            product.Quantity = dto.Quantity ?? product.Quantity;
            product.ProductTypeId = dto.ProductTypeId ?? product.ProductTypeId;
            product.Image = dto.Image ?? product.Image;
            product.ManufacturerId = dto.ManufacturerId ?? product.ManufacturerId;

            await _productRepository.UpdateAsync(product);

            return Ok(product);
        }

        /// <summary>
        /// Delete product (requires authentication)
        /// </summary>
       // ==========================
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            await _productRepository.DeleteAsync(product);

            return Ok(new { message = "Product deleted successfully" });
        }


        /// <summary>
        /// Get products by productType
        /// </summary>
        [HttpGet("type/{productTypeId}")]
        public async Task<IActionResult> GetByProductType(int productTypeId)
        {
            var products = await _productRepository.GetByProductTypeAsync(productTypeId);

            var result = products.Select(p => new
            {
                p.Id,
                p.Name,
                p.Price,
                p.Image
            });

            return Ok(result);
      
        }
    }

    // DTOs
    public class ProductCreateDto
    {
        public string Name { get; set; } = "";
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int ProductTypeId { get; set; }
        public string? Image { get; set; }
        public int ManufacturerId { get; set; }
    }

    public class ProductUpdateDto
    {
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public int? ProductTypeId { get; set; }
        public string? Image { get; set; }
        public int? ManufacturerId { get; set; }
    }
}
