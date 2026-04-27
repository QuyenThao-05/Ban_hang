using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// API quản lý loại sản phẩm (ProductType)
    /// Chức năng:
    /// ✔ Hiển thị danh sách
    /// ✔ Tìm kiếm
    /// ✔ Phân trang
    /// ✔ Thêm
    /// ✔ Sửa
    /// ✔ Xóa
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProductTypesController : ControllerBase
    {
        private readonly IProductTypeRepositoryEF _productTypeRepository;

        /// <summary>
        /// Constructor inject repository
        /// </summary>
        public ProductTypesController(IProductTypeRepositoryEF productTypeRepository)
        {
            _productTypeRepository = productTypeRepository;
        }

        // =========================================================
        // GET ALL PRODUCT TYPES + SEARCH + PAGINATION
        // URL:
        // GET /api/producttypes?search=but&page=1&pageSize=10
        // =========================================================
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            int page = 1,
            int pageSize = 10)
        {
            var query = (await _productTypeRepository.GetAllAsync()).AsQueryable();

            // 🔍 Tìm kiếm theo tên
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(pt =>
                    pt.Name.Contains(search));
            }

            // 📊 Tổng số bản ghi
            var totalCount = query.Count();

            // 📄 Phân trang
            var items = query
                .OrderByDescending(pt => pt.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(pt => new
                {
                    pt.Id,
                    pt.Name,
                    pt.Description
                })
                .ToList();

            return Ok(new
            {
                items,
                totalCount,
                page,
                pageSize
            });
        }

        // =========================================================
        // GET PRODUCT TYPE BY ID
        // URL:
        // GET /api/producttypes/1
        // =========================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var productType = await _productTypeRepository.GetByIdAsync(id);

            if (productType == null)
                return NotFound("Không tìm thấy loại sản phẩm");

            return Ok(new
            {
                productType.Id,
                productType.Name,
                productType.Description
            });
        }

        // =========================================================
        // ADD PRODUCT TYPE
        // URL:
        // POST /api/producttypes
        // =========================================================
        [HttpPost]
        public async Task<IActionResult> Add(
            [FromBody] ProductTypeCreateRequest req)
        {
            // ⚠ Validate
            if (req == null || string.IsNullOrEmpty(req.Name))
                return BadRequest("Tên loại sản phẩm không được để trống");

            var productType = new ProductType
            {
                Name = req.Name,
                Description = req.Description
            };

            await _productTypeRepository.AddAsync(productType);

            return CreatedAtAction(
                nameof(GetById),
                new { id = productType.Id },
                productType);
        }

        // =========================================================
        // UPDATE PRODUCT TYPE
        // URL:
        // PUT /api/producttypes/1
        // =========================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] ProductTypeUpdateRequest req)
        {
            var productType = await _productTypeRepository.GetByIdAsync(id);

            if (productType == null)
                return NotFound("Không tìm thấy loại sản phẩm");

            // ✏ Cập nhật dữ liệu
            productType.Name = req.Name ?? productType.Name;
            productType.Description = req.Description ?? productType.Description;

            await _productTypeRepository.UpdateAsync(productType);

            return Ok(productType);
        }

        // =========================================================
        // DELETE PRODUCT TYPE
        // URL:
        // DELETE /api/producttypes/1
        // =========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var productType = await _productTypeRepository.GetByIdAsync(id);

            if (productType == null)
                return NotFound("Không tìm thấy loại sản phẩm");

            await _productTypeRepository.DeleteAsync(productType);

            return Ok(new
            {
                message = "Xóa loại sản phẩm thành công"
            });
        }
    }

    // =========================================================
    // DTO CREATE PRODUCT TYPE
    // =========================================================
    public class ProductTypeCreateRequest
    {
        public string Name { get; set; } = "";

        public string? Description { get; set; }
    }

    // =========================================================
    // DTO UPDATE PRODUCT TYPE
    // =========================================================
    public class ProductTypeUpdateRequest
    {
        public string? Name { get; set; }

        public string? Description { get; set; }
    }
}