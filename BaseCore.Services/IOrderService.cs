using BaseCore.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public interface IOrderService
    {
        Task<Bill> CreateOrderAsync(Bill order);
        Task<List<Bill>> GetOrdersByUserIdAsync(System.Guid userId);
        Task<Bill> GetOrderByIdAsync(int id);
    }
}
