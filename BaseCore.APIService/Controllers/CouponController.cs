using BaseCore.Entities;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CouponsController : ControllerBase
    {
        private readonly ICouponService _service;

        public CouponsController(ICouponService service)
        {
            _service = service;
        }

        // GET /api/coupons?search=SALE&isActive=true&page=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] bool? isActive,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _service.GetAll(search, isActive, page, pageSize);

            return Ok(new
            {
                items = items.Select(c => new
                {
                    c.Id,
                    c.Code,
                    c.Description,
                    c.DiscountType,
                    c.DiscountValue,
                    c.MinOrderValue,
                    c.MaxUses,
                    c.UsedCount,
                    c.StartDate,
                    c.EndDate,
                    c.IsActive,
                    c.CreatedAt
                }),
                totalCount,
                page,
                pageSize
            });
        }

        // GET /api/coupons/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var c = await _service.GetById(id);
            if (c == null) return NotFound(new { message = "Không tìm thấy mã khuyến mãi" });
            return Ok(c);
        }

        // GET /api/coupons/check/SALE10
        [HttpGet("check/{code}")]
        public async Task<IActionResult> CheckCode(string code)
        {
            var c = await _service.GetByCode(code.ToUpper());
            if (c == null) return NotFound(new { message = "Mã không tồn tại" });
            if (!c.IsActive) return BadRequest(new { message = "Mã đã bị vô hiệu hoá" });
            if (c.EndDate.HasValue && c.EndDate < DateTime.Now)
                return BadRequest(new { message = "Mã đã hết hạn" });
            if (c.MaxUses > 0 && c.UsedCount >= c.MaxUses)
                return BadRequest(new { message = "Mã đã hết lượt sử dụng" });

            return Ok(new
            {
                c.Id,
                c.Code,
                c.DiscountType,
                c.DiscountValue,
                c.MinOrderValue,
                message = "Mã hợp lệ"
            });
        }

        // POST /api/coupons
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CouponRequest req)
        {
            try
            {
                var coupon = new Coupon
                {
                    Code = req.Code,
                    Description = req.Description,
                    DiscountType = req.DiscountType,
                    DiscountValue = req.DiscountValue,
                    MinOrderValue = req.MinOrderValue,
                    MaxUses = req.MaxUses,
                    StartDate = req.StartDate,
                    EndDate = req.EndDate,
                    IsActive = req.IsActive
                };

                var created = await _service.Create(coupon);
                return Ok(new { message = "Thêm thành công", id = created.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/coupons/1
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] CouponRequest req)
        {
            try
            {
                var coupon = new Coupon
                {
                    Id = id,
                    Code = req.Code,
                    Description = req.Description,
                    DiscountType = req.DiscountType,
                    DiscountValue = req.DiscountValue,
                    MinOrderValue = req.MinOrderValue,
                    MaxUses = req.MaxUses,
                    StartDate = req.StartDate,
                    EndDate = req.EndDate,
                    IsActive = req.IsActive
                };

                await _service.Update(coupon);
                return Ok(new { message = "Cập nhật thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/coupons/1
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

    public class CouponRequest
    {
        public string Code { get; set; } = "";
        public string? Description { get; set; }
        public string DiscountType { get; set; } = "Percent";
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; } = 0;
        public int MaxUses { get; set; } = 0;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}