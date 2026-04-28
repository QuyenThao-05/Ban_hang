using BaseCore.DTO.Bill;
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
    public interface IBillService
    {
        Task<(List<BillDashboardResponse> Items, int TotalCount)>
            GetDashboardBills(
                int page,
                int pageSize,
                string? search,
                string? status);

        Task<Bill?> GetById(int id);

        Task<Bill> CreateBill(CreateBillRequest request);

        Task UpdateStatus(
            int billId,
            string status);

        Task DeleteBill(int billId);
    }
    public class BillService : IBillService
    {
        private readonly IBillRepositoryEF _billRepository;
        private readonly MySqlDbContext _context;

        public BillService(
            IBillRepositoryEF billRepository,
            MySqlDbContext context)
        {
            _billRepository = billRepository;
            _context = context;
        }

        // =====================================================
        // DASHBOARD
        // =====================================================
        public async Task<(List<BillDashboardResponse> Items, int TotalCount)>
            GetDashboardBills(
                int page,
                int pageSize,
                string? search,
                string? status)
        {
            return await _billRepository
                .GetDashboardBillsAsync(
                    page,
                    pageSize,
                    search,
                    status);
        }

        // =====================================================
        // GET DETAIL
        // =====================================================
        public async Task<Bill?> GetById(int id)
        {
            return await _billRepository
                .GetDetailAsync(id);
        }

        // =====================================================
        // CREATE BILL
        // BUY NOW / CHECKOUT
        // =====================================================
        public async Task<Bill> CreateBill(
            CreateBillRequest request)
        {
            if (request.Items == null ||
                !request.Items.Any())
                throw new Exception(
                    "Đơn hàng không có sản phẩm");

            decimal totalPrice = 0;

            var billDetails = new List<BillDetail>();

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

                billDetails.Add(new BillDetail
                {
                    ProductId = item.ProductId,
                    ProductDetailId = item.ProductDetailId,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    TotalPrice = detailTotal
                });
            }

            var bill = new Bill
            {
                UserId = request.UserId,
                ShippingAddress = request.ShippingAddress,
                PaymentMethod = request.PaymentMethod,
                Status = "Pending",
                CreatedAt = DateTime.Now,
                TotalPrice = totalPrice,
                BillDetails = billDetails
            };

            await _billRepository.CreateBillAsync(
                bill);

            await _context.SaveChangesAsync();

            return bill;
        }

        // =====================================================
        // UPDATE STATUS
        // =====================================================
        public async Task UpdateStatus(
            int billId,
            string status)
        {
            var bill =
                await _billRepository.GetDetailAsync(
                    billId);

            if (bill == null)
                throw new Exception(
                    "Không tìm thấy đơn hàng");

            bill.Status = status;

            await _billRepository.UpdateBillAsync(
                bill);
        }

        // =====================================================
        // DELETE BILL
        // =====================================================
        public async Task DeleteBill(int billId)
        {
            var bill =
                await _billRepository.GetDetailAsync(
                    billId);

            if (bill == null)
                throw new Exception(
                    "Không tìm thấy đơn hàng");

            await _billRepository.DeleteBillAsync(
                bill);
        }
    }
}