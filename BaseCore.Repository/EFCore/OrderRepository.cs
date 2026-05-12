using BaseCore.DTO.Order;
using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Order Repository using Entity Framework Core
    /// </summary>
    public interface IOrderRepositoryEF : IRepository<Order>
    {
        Task<(List<OrderDashboardResponse> Items, int TotalCount)>
            GetDashboardOrdersAsync(
                int page,
                int pageSize,
                string? search,
                string? status);

        Task<Order?> GetDetailAsync(int OrderId);

        Task CreateOrderAsync(Order Order);

        Task UpdateOrderAsync(Order Order);

        Task DeleteOrderAsync(Order Order);
    }

    public class OrderRepositoryEF
       : Repository<Order>, IOrderRepositoryEF
    {
        private readonly MySqlDbContext _context;

        public OrderRepositoryEF(MySqlDbContext context)
            : base(context)
        {
            _context = context;
        }

        // =====================================================
        // DASHBOARD SEARCH + FILTER + PAGINATION
        // =====================================================
        public async Task<(List<OrderDashboardResponse> Items, int TotalCount)>
            GetDashboardOrdersAsync(
                int page,
                int pageSize,
                string? search,
                string? status)
        {
            var query = _context.Orders
                .Include(b => b.User)
                .AsQueryable();

            // 🔍 Search customer
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();

                query = query.Where(b =>
                    b.User.Username.ToLower().Contains(search) ||

                    (b.User.FullName != null &&
                     b.User.FullName.ToLower().Contains(search))
                );
            }

            // 🎯 Filter status
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(b =>
                    b.Status == status);
            }

            // 📊 Total count
            var totalCount = await query.CountAsync();

            // 📄 Pagination
            var items = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new OrderDashboardResponse
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    CustomerName = b.User.FullName ?? b.User.Username,
                    TotalPrice = b.TotalPrice,
                    Status = b.Status,
                    ShippingAddress = b.ShippingAddress,
                    PaymentMethod = b.PaymentMethod,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return (items, totalCount);
        }

        // =====================================================
        // GET BILL DETAIL
        // =====================================================
        public async Task<Order?> GetDetailAsync(int OrderId)
        {
            return await _context.Orders
                .Include(b => b.User)
                .Include(b => b.OrderDetails)
                    .ThenInclude(d => d.Product)
                .Include(b => b.OrderDetails)
                    .ThenInclude(d => d.ProductDetail)
                .FirstOrDefaultAsync(b =>
                    b.Id == OrderId);
        }

        // =====================================================
        // CREATE BILL
        // =====================================================
        public async Task CreateOrderAsync(Order Order)
        {
            _context.Orders.Add(Order);

            await _context.SaveChangesAsync();
        }

        // =====================================================
        // UPDATE BILL
        // =====================================================
        public async Task UpdateOrderAsync(Order Order)
        {
            _context.Orders.Update(Order);

            await _context.SaveChangesAsync();
        }

        // =====================================================
        // DELETE BILL
        // =====================================================
        public async Task DeleteOrderAsync(Order Order)
        {
            _context.Orders.Remove(Order);

            await _context.SaveChangesAsync();
        }
    }
}
