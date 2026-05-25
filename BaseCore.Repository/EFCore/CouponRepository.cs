using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Repository.EFCore
{
    public interface ICouponRepository
    {
        Task<(List<Coupon> Items, int TotalCount)> GetAllAsync(string? search, bool? isActive, int page, int pageSize);
        Task<Coupon?> GetByIdAsync(int id);
        Task<Coupon?> GetByCodeAsync(string code);
        Task<Coupon> CreateAsync(Coupon coupon);
        Task UpdateAsync(Coupon coupon);
        Task DeleteAsync(int id);
    }

    public class CouponRepository : ICouponRepository
    {
        private readonly MySqlDbContext _context;

        public CouponRepository(MySqlDbContext context)
        {
            _context = context;
        }

        public async Task<(List<Coupon> Items, int TotalCount)> GetAllAsync(
            string? search, bool? isActive, int page, int pageSize)
        {
            var query = _context.Coupons.AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(c =>
                    EF.Functions.Like(c.Code, $"%{search}%") ||
                    (c.Description != null && EF.Functions.Like(c.Description, $"%{search}%")));

            if (isActive.HasValue)
                query = query.Where(c => c.IsActive == isActive.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Coupon?> GetByIdAsync(int id)
            => await _context.Coupons.FindAsync(id);

        public async Task<Coupon?> GetByCodeAsync(string code)
            => await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code);

        public async Task<Coupon> CreateAsync(Coupon coupon)
        {
            var existing = await GetByCodeAsync(coupon.Code);
            if (existing != null)
                throw new Exception("Mã khuyến mãi đã tồn tại");

            coupon.CreatedAt = DateTime.Now;
            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();
            return coupon;
        }

        public async Task UpdateAsync(Coupon coupon)
        {
            var existing = await _context.Coupons.FindAsync(coupon.Id);
            if (existing == null)
                throw new Exception("Không tìm thấy mã khuyến mãi");

            existing.Code = coupon.Code;
            existing.Description = coupon.Description;
            existing.DiscountType = coupon.DiscountType;
            existing.DiscountValue = coupon.DiscountValue;
            existing.MinOrderValue = coupon.MinOrderValue;
            existing.MaxUses = coupon.MaxUses;
            existing.StartDate = coupon.StartDate;
            existing.EndDate = coupon.EndDate;
            existing.IsActive = coupon.IsActive;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
                throw new Exception("Không tìm thấy mã khuyến mãi");

            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();
        }
    }
}