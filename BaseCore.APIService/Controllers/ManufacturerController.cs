using BaseCore.Entities;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManufacturersController : ControllerBase
    {
        private readonly IManufacturerService _service;

        public ManufacturersController(IManufacturerService service)
        {
            _service = service;
        }

        // GET /api/manufacturers?search=thiên&page=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _service.GetAll(search, page, pageSize);

            return Ok(new
            {
                items = items.Select(m => new
                {
                    m.Id,
                    m.Name,
                    m.Address,
                    m.Phone
                }),
                totalCount,
                page,
                pageSize
            });
        }

        // GET /api/manufacturers/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var m = await _service.GetById(id);
            if (m == null)
                return NotFound(new { message = "Không tìm thấy nhà sản xuất" });

            return Ok(new { m.Id, m.Name, m.Address, m.Phone });
        }

        // POST /api/manufacturers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ManufacturerRequest req)
        {
            // ✅ Thêm dòng này để debug
            if (req == null)
                return BadRequest(new { message = "req is null" });

            if (!ModelState.IsValid)
                return BadRequest(new { message = "ModelState invalid", errors = ModelState });

            try
            {
                var manufacturer = new Manufacturer
                {
                    Name = req.Name,
                    Address = req.Address,
                    Phone = req.Phone
                };

                var created = await _service.Create(manufacturer);
                return Ok(new { message = "Thêm thành công", id = created.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/manufacturers/1
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] ManufacturerRequest req)
        {
            try
            {
                var manufacturer = new Manufacturer
                {
                    Id = id,
                    Name = req.Name,
                    Address = req.Address,
                    Phone = req.Phone
                };

                await _service.Update(manufacturer);
                return Ok(new { message = "Cập nhật thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/manufacturers/1
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.Delete(id);
                return Ok(new { message = "Xoá thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class ManufacturerRequest
    {
        public string Name { get; set; } = "";
        public string? Address { get; set; }
        public string? Phone { get; set; }
    }
}