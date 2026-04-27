using BaseCore.DTO.Bill;
using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Order Repository using Entity Framework Core
    /// </summary>
    public interface IBillRepositoryEF : IRepository<Bill>
    {
        Task<(List<BillDashboardResponse> Items, int TotalCount)>
            GetDashboardBillsAsync(
                int page,
                int pageSize,
                string? search,
                string? status);

        Task<Bill?> GetDetailAsync(int billId);

        Task CreateBillAsync(Bill bill);

        Task UpdateBillAsync(Bill bill);

        Task DeleteBillAsync(Bill bill);
    }

    public class BillRepositoryEF
       : Repository<Bill>, IBillRepositoryEF
    {
        private readonly MySqlDbContext _context;

        public BillRepositoryEF(MySqlDbContext context)
            : base(context)
        {
            _context = context;
        }

        // =====================================================
        // DASHBOARD SEARCH + FILTER + PAGINATION
        // =====================================================
        public async Task<(List<BillDashboardResponse> Items, int TotalCount)>
            GetDashboardBillsAsync(
                int page,
                int pageSize,
                string? search,
                string? status)
        {
            var query = _context.Bills
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
                .Select(b => new BillDashboardResponse
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
        public async Task<Bill?> GetDetailAsync(int billId)
        {
            return await _context.Bills
                .Include(b => b.User)
                .Include(b => b.BillDetails)
                    .ThenInclude(d => d.Product)
                .Include(b => b.BillDetails)
                    .ThenInclude(d => d.ProductDetail)
                .FirstOrDefaultAsync(b =>
                    b.Id == billId);
        }

        // =====================================================
        // CREATE BILL
        // =====================================================
        public async Task CreateBillAsync(Bill bill)
        {
            _context.Bills.Add(bill);

            await _context.SaveChangesAsync();
        }

        // =====================================================
        // UPDATE BILL
        // =====================================================
        public async Task UpdateBillAsync(Bill bill)
        {
            _context.Bills.Update(bill);

            await _context.SaveChangesAsync();
        }

        // =====================================================
        // DELETE BILL
        // =====================================================
        public async Task DeleteBillAsync(Bill bill)
        {
            _context.Bills.Remove(bill);

            await _context.SaveChangesAsync();
        }
    }
}
