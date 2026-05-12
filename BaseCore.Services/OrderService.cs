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
        Task<(List<OrderDashboardResponse> Items, int TotalCount)>
            GetDashboardOrders(
                int page,
                int pageSize,
                string? search,
                string? status);

        Task<Order?> GetById(int id);

        Task<Order> CreateOrder(CreateOrderRequest request);

        Task UpdateStatus(
            int OrderId,
            string status);

        Task DeleteOrder(int OrderId);
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
        // DASHBOARD
        // =====================================================
        public async Task<(List<OrderDashboardResponse> Items, int TotalCount)>
            GetDashboardOrders(
                int page,
                int pageSize,
                string? search,
                string? status)
        {
            return await _OrderRepository
                .GetDashboardOrdersAsync(
                    page,
                    pageSize,
                    search,
                    status);
        }

        // =====================================================
        // GET DETAIL
        // =====================================================
        public async Task<Order?> GetById(int id)
        {
            return await _OrderRepository
                .GetDetailAsync(id);
        }

        // =====================================================
        // CREATE BILL
        // BUY NOW / CHECKOUT
        // =====================================================
        public async Task<Order> CreateOrder(
            CreateOrderRequest request)
        {
            if (request.Items == null ||
                !request.Items.Any())
                throw new Exception(
                    "Đơn hàng không có sản phẩm");

            decimal totalPrice = 0;

            var OrderDetails = new List<OrderDetail>();

            foreach (var item in request.Items)
            {
                var product =
                    await _context.Products
                        .FirstOrDefaultAsync(p =>
                            p.Id == item.ProductId);

                if (product == null)
                    throw new Exception(
                        $"Không tìm thấy sản phẩm ID {item.ProductId}");

                ProductDetail? productDetail = null;
                if (product == null)
                    throw new Exception("Product null");

                if (item == null)
                    throw new Exception("Item null");

                if (item.Price <= 0)
                    throw new Exception("Price invalid");
                if (item.ProductDetailId.HasValue)
                {
                    productDetail =
                        await _context.ProductDetails
                            .FirstOrDefaultAsync(pd =>
                                pd.Id == item.ProductDetailId.Value);

                    if (productDetail == null)
                        throw new Exception(
                            "Không tìm thấy biến thể sản phẩm");

                    // 🚫 Hết hàng
                    if (productDetail.Quantity < item.Quantity)
                        throw new Exception(
                            $"Không đủ tồn kho cho sản phẩm {product.Name}");

                    // 📉 Trừ kho
                    productDetail.Quantity -= item.Quantity;
                }

                var detailTotal =
                    item.Quantity * item.Price;

                totalPrice += detailTotal;

                OrderDetails.Add(new OrderDetail
                {
                    ProductId = item.ProductId,
                    ProductDetailId = item.ProductDetailId,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    TotalPrice = detailTotal
                });
            }

            var Order = new Order
            {
                UserId = request.UserId,
                ShippingAddress = request.ShippingAddress,
                PaymentMethod = request.PaymentMethod,
                Status = "Pending",
                CreatedAt = DateTime.Now,
                TotalPrice = totalPrice,
                OrderDetails = OrderDetails
            };

            await _OrderRepository.CreateOrderAsync(
                Order);

            await _context.SaveChangesAsync();

            return Order;
        }

        // =====================================================
        // UPDATE STATUS
        // =====================================================
        public async Task UpdateStatus(
            int OrderId,
            string status)
        {
            var Order =
                await _OrderRepository.GetDetailAsync(
                    OrderId);

            if (Order == null)
                throw new Exception(
                    "Không tìm thấy đơn hàng");

            Order.Status = status;

            await _OrderRepository.UpdateOrderAsync(
                Order);
        }

        // =====================================================
        // DELETE BILL
        // =====================================================
        public async Task DeleteOrder(int OrderId)
        {
            var Order =
                await _OrderRepository.GetDetailAsync(
                    OrderId);

            if (Order == null)
                throw new Exception(
                    "Không tìm thấy đơn hàng");

            await _OrderRepository.DeleteOrderAsync(
                Order);
        }
    }
}