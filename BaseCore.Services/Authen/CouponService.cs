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

            coupon.Code = coupon.Code.ToUpper().Trim();
            return await _repository.CreateAsync(coupon);
        }

        public async Task Update(Coupon coupon)
        {
            if (string.IsNullOrEmpty(coupon.Code))
                throw new Exception("Mã không được để trống");

            if (coupon.DiscountValue <= 0)
                throw new Exception("Giá trị giảm phải lớn hơn 0");

            coupon.Code = coupon.Code.ToUpper().Trim();
            await _repository.UpdateAsync(coupon);
        }

        public async Task Delete(int id)
            => await _repository.DeleteAsync(id);
    }
}