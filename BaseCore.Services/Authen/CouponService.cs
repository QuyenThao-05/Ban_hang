using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public interface ICouponService
    {
        Task<(List<Coupon> Items, int TotalCount)> GetAll(string? search, bool? isActive, int page, int pageSize);
        Task<Coupon?> GetById(int id);
        Task<Coupon?> GetByCode(string code);
        Task<Coupon> Create(Coupon coupon);
        Task Update(Coupon coupon);
        Task Delete(int id);

        Task<decimal> ApplyCoupon(string code, decimal orderTotal);
        Task<Coupon> ValidateCoupon(string code);
        Task IncreaseUsedCount(string code);

    }

    public class CouponService : ICouponService
    {
        private readonly ICouponRepository _repository;

        public CouponService(ICouponRepository repository)
        {
            _repository = repository;
        }

        public async Task<(List<Coupon> Items, int TotalCount)> GetAll(
            string? search, bool? isActive, int page, int pageSize)
            => await _repository.GetAllAsync(search, isActive, page, pageSize);

        public async Task<Coupon?> GetById(int id)
            => await _repository.GetByIdAsync(id);

        public async Task<Coupon?> GetByCode(string code)
            => await _repository.GetByCodeAsync(code);

        public async Task<Coupon> Create(Coupon coupon)
        {
            if (string.IsNullOrEmpty(coupon.Code))
                throw new Exception("Mã không được để trống");

            if (coupon.DiscountValue <= 0)
                throw new Exception("Giá trị giảm phải lớn hơn 0");

            if (coupon.DiscountType == "Percent" && coupon.DiscountValue > 100)
                throw new Exception("Phần trăm giảm không được vượt quá 100%");
            if (coupon.MaxUses < 0)
            {
                throw new Exception("Tổng lượt sử dụng không hợp lệ");
            }

            coupon.Code = coupon.Code.ToUpper().Trim();
            return await _repository.CreateAsync(coupon);
        }

        public async Task Update(Coupon coupon)
        {
            if (string.IsNullOrEmpty(coupon.Code))
                throw new Exception("Mã không được để trống");

            if (coupon.DiscountValue <= 0)
                throw new Exception("Giá trị giảm phải lớn hơn 0");
            if (coupon.UsedCount > coupon.MaxUses &&
             coupon.MaxUses > 0)
            {
                throw new Exception(
                    "Số lượt đã dùng không được lớn hơn tổng lượt"
                );
            }

            coupon.Code = coupon.Code.ToUpper().Trim();
            await _repository.UpdateAsync(coupon);
        }

        public async Task Delete(int id)
            => await _repository.DeleteAsync(id);
        public async Task<decimal> ApplyCoupon(
        string code,
        decimal orderTotal)
        {
            var coupon = await _repository.GetByCodeAsync(code);

            if (coupon == null)
                throw new Exception("Mã giảm giá không tồn tại");

            if (!coupon.IsActive)
                throw new Exception("Mã giảm giá đã bị khóa");

            if (coupon.StartDate.HasValue &&
                coupon.StartDate > DateTime.Now)
            {
                throw new Exception("Mã giảm giá chưa đến thời gian sử dụng");
            }

            if (coupon.EndDate.HasValue &&
                coupon.EndDate < DateTime.Now)
            {
                throw new Exception("Mã giảm giá đã hết hạn");
            }

            if (coupon.MaxUses > 0 &&
                coupon.UsedCount >= coupon.MaxUses)
            {
                throw new Exception("Mã giảm giá đã hết lượt");
            }

            if (orderTotal < coupon.MinOrderValue)
            {
                throw new Exception(
                    $"Đơn hàng tối thiểu phải đạt {coupon.MinOrderValue:N0}đ"
                );
            }

            decimal discount;

            if (coupon.DiscountType == "Percent")
            {
                discount = orderTotal * coupon.DiscountValue / 100;
            }
            else
            {
                discount = coupon.DiscountValue;
            }

            coupon.UsedCount++;

            await _repository.UpdateAsync(coupon);

            return discount;
        }
        public async Task<Coupon> ValidateCoupon(string code)
        {
            var coupon = await _repository.GetByCodeAsync(code);

            if (coupon == null)
                throw new Exception("Mã khuyến mãi không tồn tại");

            if (!coupon.IsActive)
                throw new Exception("Mã khuyến mãi đã bị khóa");

            if (coupon.EndDate.HasValue &&
                coupon.EndDate.Value < DateTime.Now)
            {
                throw new Exception("Mã khuyến mãi đã hết hạn");
            }

            if (coupon.MaxUses > 0 &&
                coupon.UsedCount >= coupon.MaxUses)
            {
                throw new Exception("Mã khuyến mãi đã hết lượt sử dụng");
            }

            return coupon;
        }
        public async Task IncreaseUsedCount(string code)
        {
            var coupon = await _repository.GetByCodeAsync(code);

            if (coupon == null)
                return;

            coupon.UsedCount++;

            await _repository.UpdateAsync(coupon);
        }
    }
}