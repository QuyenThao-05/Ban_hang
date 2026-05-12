using BaseCore.DTO.Order;
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
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _OrderService;

        public OrderController(
            IOrderService OrderService)
        {
            _OrderService = OrderService;
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
            var result = await _OrderService.GetDashboardOrders(
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
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllOrder(
            [FromQuery] string? search,
            [FromQuery] string? status,
            int page = 1,
            int pageSize = 10)
        {
            var result = await _OrderService.GetDashboardOrders(
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
            var Order = await _OrderService.GetById(id);

            if (Order == null)
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng"
                });

            var result = new
            {
                Order.Id,
                Order.UserId,
                CustomerName = Order.User.FullName ?? Order.User.Username,
                Order.TotalPrice,
                Order.Status,
                Order.ShippingAddress,
                Order.PaymentMethod,
                Order.CreatedAt,

                Items = Order.OrderDetails.Select(d => new
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
           [FromBody] CreateOrderRequest request)
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
                var Order = await _OrderService.CreateOrder(request);

                return Ok(new
                {
                    message = "Tạo đơn hàng thành công",
                    OrderId = Order.Id,
                    totalPrice = Order.TotalPrice,
                    status = Order.Status
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
           [FromBody] UpdateOrderStatusRequest req)
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
                await _OrderService.UpdateStatus(
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
                await _OrderService.UpdateStatus(
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
                await _OrderService.DeleteOrder(id);

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
