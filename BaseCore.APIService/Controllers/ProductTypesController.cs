using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class ProductTypesController : ControllerBase
{
    private readonly IProductTypeRepositoryEF _productTypeRepository;

    public ProductTypesController(IProductTypeRepositoryEF productTypeRepository)
    {
        _productTypeRepository = productTypeRepository;
    }

    // ==========================
    // GET ALL PRODUCT TYPES
    // ==========================
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var productTypes = await _productTypeRepository.GetAllAsync();

        var result = productTypes.Select(pt => new
        {
            pt.Id,
            pt.Name
        });

        return Ok(result);
    }

    // ==========================
    // GET PRODUCT TYPE BY ID
    // ==========================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var productType = await _productTypeRepository.GetByIdAsync(id);

        if (productType == null)
            return NotFound("Không tìm thấy loại sản phẩm");

        return Ok(new
        {
            productType.Id,
            productType.Name
        });
    }

    // ==========================
    // ADD PRODUCT TYPE
    // ==========================
    [HttpPost]
    public async Task<IActionResult> Add(
        [FromBody] ProductTypeCreateRequest req)
    {
        var productType = new ProductType
        {
            Name = req.Name
        };

        await _productTypeRepository.AddAsync(productType);

        return CreatedAtAction(
            nameof(GetById),
            new { id = productType.Id },
            productType);
    }

    // ==========================
    // UPDATE PRODUCT TYPE
    // ==========================
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] ProductTypeUpdateRequest req)
    {
        var productType = await _productTypeRepository.GetByIdAsync(id);

        if (productType == null)
            return NotFound("Không tìm thấy loại sản phẩm");

        productType.Name = req.Name ?? productType.Name;

        await _productTypeRepository.UpdateAsync(productType);

        return Ok(productType);
    }

    // ==========================
    // DELETE PRODUCT TYPE
    // ==========================
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

// ==========================
// DTO CREATE
// ==========================
public class ProductTypeCreateRequest
{
    public string Name { get; set; } = "";
}

// ==========================
// DTO UPDATE
// ==========================
public class ProductTypeUpdateRequest
{
    public string? Name { get; set; }
}