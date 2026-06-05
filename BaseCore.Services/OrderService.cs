using BaseCore.DTO.Order;
using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public interface IOrderService
    {
        Task<(List<OrderDashboardResponse> Items, int TotalCount)> GetDashboardOrders(
            int page,
            int pageSize,
            string? search,
            string? status,
            string? paymentStatus,
            DateTime? fromDate,
            DateTime? toDate);

        Task<Order?> GetById(int id);

        Task<Order> CreateOrder(CreateOrderRequest request);

        Task UpdateStatus(int orderId, string status);

        Task UpdatePaymentStatus(int id, string paymentStatus);

        Task CancelOrder(int id, string reason);

        Task DeleteOrder(int orderId);
    }

    public class OrderService : IOrderService
    {
        private readonly IOrderRepositoryEF _OrderRepository;
        private readonly MySqlDbContext _context;

        public OrderService(
            IOrderRepositoryEF OrderRepository,
            MySqlDbContext context)
        {
            _OrderRepository = OrderRepository;
            _context = context;
        }

        // =====================================================
        // DASHBOARD / ORDER LIST
        // =====================================================
        public async Task<(List<OrderDashboardResponse> Items, int TotalCount)> GetDashboardOrders(
            int page,
            int pageSize,
            string? search,
            string? status,
            string? paymentStatus,
            DateTime? fromDate,
            DateTime? toDate)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;

            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(x => x.Product)
                .Include(o => o.OrderDetails)
                    .ThenInclude(x => x.ProductDetail)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();

                query = query.Where(o =>
                    o.Id.ToString().Contains(search) ||
                    ((o.User.FullName ?? "").ToLower().Contains(search)) ||
                    ((o.User.Username ?? "").ToLower().Contains(search)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(o => o.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(paymentStatus))
            {
                query = query.Where(o => o.PaymentStatus == paymentStatus);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                var endDate = toDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(o => o.CreatedAt <= endDate);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderDashboardResponse
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    CustomerName = o.User != null
        ? (o.User.FullName ?? o.User.Username)
        : "N/A",
                    CustomerPhone = o.CustomerPhone,
                    CustomerEmail = o.CustomerEmail,
                    TotalPrice = o.TotalPrice,
                    DiscountAmount = o.DiscountAmount,
                    ShippingFee = o.ShippingFee,
                    FinalAmount = o.FinalAmount > 0 ? o.FinalAmount : o.TotalPrice,
                    Status = o.Status,
                    PaymentStatus = o.PaymentStatus,
                    PaymentMethod = o.PaymentMethod,
                    ShippingAddress = o.ShippingAddress,
                    Note = o.Note,
                    CancelReason = o.CancelReason,

                    OrderDetails = o.OrderDetails.Select(d => new OrderDetailResponse
                    {
                        Id = d.Id,
                        ProductId = d.ProductId,

                        ProductName = d.Product.Name,

                        ProductImage = d.Product.Image,

                        Quantity = d.Quantity,

                        Price = d.Price,

                        TotalPrice = d.TotalPrice,

                        Color = d.ProductDetail != null
                            ? d.ProductDetail.Color
                            : "",

                        Size = d.ProductDetail != null
                            ? d.ProductDetail.Size
                            : ""
                    }).ToList(),

                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    ConfirmedAt = o.ConfirmedAt,
                    CompletedAt = o.CompletedAt,
                    CancelledAt = o.CancelledAt,
                })
                .ToListAsync();

            return (items, totalCount);
        }

        // =====================================================
        // GET DETAIL
        // =====================================================
        public async Task<Order?> GetById(int id)
        {
            return await _OrderRepository.GetDetailAsync(id);
        }

        // =====================================================
        // CREATE BILL / CHECKOUT
        // =====================================================
        public async Task<Order> CreateOrder(CreateOrderRequest request)
        {
            if (request.Items == null || !request.Items.Any())
                throw new Exception("Đơn hàng không có sản phẩm");

            decimal totalPrice = 0;
            var orderDetails = new List<OrderDetail>();

            foreach (var item in request.Items)
            {
                if (item == null)
                    throw new Exception("Item null");

                if (item.Price <= 0)
                    throw new Exception("Price invalid");

                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId);

                if (product == null)
                    throw new Exception($"Không tìm thấy sản phẩm ID {item.ProductId}");

                ProductDetail? productDetail = null;

                if (item.ProductDetailId.HasValue)
                {
                    productDetail = await _context.ProductDetails
                        .FirstOrDefaultAsync(pd => pd.Id == item.ProductDetailId.Value);

                    if (productDetail == null)
                        throw new Exception("Không tìm thấy biến thể sản phẩm");

                    if (productDetail.Quantity < item.Quantity)
                        throw new Exception($"Không đủ tồn kho cho sản phẩm {product.Name}");

                    // Hiện tại hệ thống đang trừ kho ngay khi tạo đơn.
                    productDetail.Quantity -= item.Quantity;
                }

                var detailTotal = item.Quantity * item.Price;
                totalPrice += detailTotal;

                orderDetails.Add(new OrderDetail
                {
                    ProductId = item.ProductId,
                    ProductDetailId = item.ProductDetailId,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    TotalPrice = detailTotal
                });
            }

            var order = new Order
            {
                UserId = request.UserId,
                ShippingAddress = request.ShippingAddress,
                PaymentMethod = request.PaymentMethod,

                Status = "Pending",
                PaymentStatus = "Unpaid",

                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,

                TotalPrice = totalPrice,

                DiscountAmount = request.DiscountAmount,

                FinalAmount = totalPrice - request.DiscountAmount,

                OrderDetails = orderDetails
            };

            await _OrderRepository.CreateOrderAsync(order);
            await _context.SaveChangesAsync();

            return order;
        }

        // =====================================================
        // UPDATE STATUS
        // =====================================================
        public async Task UpdateStatus(int orderId, string status)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            var currentStatus = order.Status;

            if (!IsValidStatusTransition(currentStatus, status))
                throw new Exception($"Không thể chuyển trạng thái từ {currentStatus} sang {status}");

            order.Status = status;
            order.UpdatedAt = DateTime.Now;

            if (status == "Confirmed")
            {
                order.ConfirmedAt = DateTime.Now;
            }

            if (status == "Completed")
            {
                order.CompletedAt = DateTime.Now;

                if (order.PaymentMethod == "COD" && order.PaymentStatus != "Paid")
                {
                    order.PaymentStatus = "Paid";
                }
            }

            await _context.SaveChangesAsync();
        }

        private bool IsValidStatusTransition(string currentStatus, string nextStatus)
        {
            var allowed = new Dictionary<string, List<string>>
            {
                ["Pending"] = new List<string> { "Confirmed", "Cancelled" },
                ["Confirmed"] = new List<string> { "Packing", "Cancelled" },
                ["Packing"] = new List<string> { "Shipping" },
                ["Shipping"] = new List<string> { "Completed", "Returned" },
                ["Completed"] = new List<string>(),
                ["Cancelled"] = new List<string>(),
                ["Returned"] = new List<string>()
            };

            return allowed.ContainsKey(currentStatus)
                && allowed[currentStatus].Contains(nextStatus);
        }

        // =====================================================
        // UPDATE PAYMENT
        // =====================================================
        public async Task UpdatePaymentStatus(int id, string paymentStatus)
        {
            var allowedPaymentStatus = new List<string>
            {
                "Unpaid",
                "Paid",
                "Refunded",
                "Failed"
            };

            if (!allowedPaymentStatus.Contains(paymentStatus))
                throw new Exception("Trạng thái thanh toán không hợp lệ");

            var order = await _context.Orders.FindAsync(id);

            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (order.Status == "Cancelled")
                throw new Exception("Không thể cập nhật thanh toán cho đơn đã hủy");

            order.PaymentStatus = paymentStatus;
            order.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        // =====================================================
        // CANCEL ORDER
        // =====================================================
        public async Task CancelOrder(int id, string reason)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (order.Status == "Completed")
                throw new Exception("Không thể hủy đơn hàng đã hoàn tất");

            if (order.Status == "Cancelled")
                throw new Exception("Đơn hàng đã được hủy trước đó");

            order.Status = "Cancelled";
            order.CancelReason = reason;
            order.CancelledAt = DateTime.Now;
            order.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        // =====================================================
        // DELETE BILL
        // =====================================================
        public async Task DeleteOrder(int orderId)
        {
            var order = await _OrderRepository.GetDetailAsync(orderId);

            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            await _OrderRepository.DeleteOrderAsync(order);
        }
    }
}
