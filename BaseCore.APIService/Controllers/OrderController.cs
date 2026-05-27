using BaseCore.DTO.Order;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Order API Controller
    /// Nâng cấp phục vụ trang quản lý đơn hàng admin.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] string? paymentStatus,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            int page = 1,
            int pageSize = 10)
        {
            var result = await _orderService.GetDashboardOrders(
                page,
                pageSize,
                search,
                status,
                paymentStatus,
                fromDate,
                toDate);

            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page,
                pageSize
            });
        }

        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetAllOrder(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] string? paymentStatus,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            int page = 1,
            int pageSize = 10)
        {
            var result = await _orderService.GetDashboardOrders(
                page,
                pageSize,
                search,
                status,
                paymentStatus,
                fromDate,
                toDate);

            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page,
                pageSize
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderService.GetById(id);

            if (order == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng"
                });
            }

            var result = new
            {
                order.Id,
                order.UserId,
                CustomerName = order.User != null
                    ? (order.User.FullName ?? order.User.Username)
                    : "N/A",

                CustomerPhone = order.CustomerPhone,
                CustomerEmail = order.CustomerEmail,

                order.TotalPrice,
                order.DiscountAmount,
                order.ShippingFee,
                FinalAmount = order.FinalAmount > 0 ? order.FinalAmount : order.TotalPrice,

                order.Status,
                order.PaymentStatus,
                order.PaymentMethod,

                order.ShippingAddress,
                order.Note,
                order.CancelReason,

                order.CreatedAt,
                order.UpdatedAt,
                order.ConfirmedAt,
                order.CompletedAt,
                order.CancelledAt,

                Items = order.OrderDetails.Select(d => new
                {
                    d.Id,
                    d.ProductId,
                    ProductName = d.Product != null ? d.Product.Name : "Sản phẩm",
                    Brand = d.ProductDetail != null ? d.ProductDetail.Brand : null,
                    Color = d.ProductDetail != null ? d.ProductDetail.Color : null,
                    Size = d.ProductDetail != null ? d.ProductDetail.Size : null,
                    d.Quantity,
                    UnitPrice = d.Price,
                    d.TotalPrice
                })
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
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
                var order = await _orderService.CreateOrder(request);

                return Ok(new
                {
                    message = "Tạo đơn hàng thành công",
                    orderId = order.Id,
                    totalPrice = order.TotalPrice,
                    status = order.Status,
                    paymentStatus = order.PaymentStatus
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

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] UpdateOrderStatusRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Status))
            {
                return BadRequest(new
                {
                    message = "Status không hợp lệ"
                });
            }

            try
            {
                await _orderService.UpdateStatus(id, req.Status);

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

        [HttpPut("{id}/payment")]
        public async Task<IActionResult> UpdatePayment(
            int id,
            [FromBody] UpdateOrderPaymentRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.PaymentStatus))
            {
                return BadRequest(new
                {
                    message = "PaymentStatus không hợp lệ"
                });
            }

            try
            {
                await _orderService.UpdatePaymentStatus(id, req.PaymentStatus);

                return Ok(new
                {
                    message = "Cập nhật thanh toán thành công"
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

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(
            int id,
            [FromBody] CancelOrderRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Reason))
            {
                return BadRequest(new
                {
                    message = "Vui lòng nhập lý do hủy đơn"
                });
            }

            try
            {
                await _orderService.CancelOrder(id, req.Reason);

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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _orderService.DeleteOrder(id);

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
