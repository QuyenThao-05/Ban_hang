using BaseCore.DTO.Bill;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Order API Controller
    /// Teaching: RESTful API, Business Logic, Authentication (Bài 10, 11)
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class BillController : ControllerBase
    {
        private readonly IBillService _billService;

        public BillController(
            IBillService billService)
        {
            _billService = billService;
        }

        /// <summary>
        /// Get orders for current user
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
             [FromQuery] string? search,
             [FromQuery] string? status,
             int page = 1,
             int pageSize = 10)
        {
            var result = await _billService.GetDashboardBills(
                page,
                pageSize,
                search,
                status);

            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page,
                pageSize
            });
        }

        /// <summary>
        /// Get all bills (Admin only)
        /// </summary>
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBill(
            [FromQuery] string? search,
            [FromQuery] string? status,
            int page = 1,
            int pageSize = 10)
        {
            var result = await _billService.GetDashboardBills(
                page,
                pageSize,
                search,
                status);

            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page,
                pageSize
            });
        }
        /// <summary>
        /// Get order by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var bill = await _billService.GetById(id);

            if (bill == null)
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng"
                });

            var result = new
            {
                bill.Id,
                bill.UserId,
                CustomerName = bill.User.FullName ?? bill.User.Username,
                bill.TotalPrice,
                bill.Status,
                bill.ShippingAddress,
                bill.PaymentMethod,
                bill.CreatedAt,

                Items = bill.BillDetails.Select(d => new
                {
                    d.Id,
                    d.ProductId,
                    ProductName = d.Product.Name,
                    Brand = d.ProductDetail != null ? d.ProductDetail.Brand : null,
                    Color = d.ProductDetail != null ? d.ProductDetail.Color : null,
                    Size = d.ProductDetail != null ? d.ProductDetail.Size : null,
                    d.Quantity,
                    d.Price,
                    d.TotalPrice
                })
            };

            return Ok(result);
        }

        /// <summary>
        /// Create new order
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create(
           [FromBody] CreateBillRequest request)
        {
            if (request == null || request.Items == null || !request.Items.Any())
            {
                return BadRequest(new
                {
                    message = "Đơn hàng không hợp lệ"
                });
            }

            try
            {
                var bill = await _billService.CreateBill(request);

                return Ok(new
                {
                    message = "Tạo đơn hàng thành công",
                    billId = bill.Id,
                    totalPrice = bill.TotalPrice,
                    status = bill.Status
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
        /// <summary>
        /// Update order status
        /// </summary>
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
           int id,
           [FromBody] UpdateBillStatusRequest req)
        {
            if (req == null || string.IsNullOrEmpty(req.Status))
            {
                return BadRequest(new
                {
                    message = "Status không hợp lệ"
                });
            }

            try
            {
                await _billService.UpdateStatus(
                    id,
                    req.Status);

                return Ok(new
                {
                    message = "Cập nhật trạng thái thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Cancel order
        /// </summary>
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            try
            {
                await _billService.UpdateStatus(
                    id,
                    "Cancelled");

                return Ok(new
                {
                    message = "Hủy đơn hàng thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
        //delele bill
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _billService.DeleteBill(id);

                return Ok(new
                {
                    message = "Xóa đơn hàng thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}
