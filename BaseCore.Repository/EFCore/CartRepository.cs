using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.Repository.EFCore
{
    public interface ICartRepositoryEF
    {
        Task<Cart> GetCartByUserIdAsync(int userId);
        Task AddToCartAsync(int userId, int productId, int quantity);
        Task RemoveFromCartAsync(int userId, int productId);
        Task UpdateSelectionAsync(int userId, int productId, bool isSelected); 

        Task SelectAllAsync(int userId, bool isSelected);
       
        Task<List<CartItem>> GetSelectedItemsAsync(int userId);
        Task IncreaseAsync(int userId, int productId);
        Task DecreaseAsync(int userId, int productId);
    }
    public class CartRepositoryEF : ICartRepositoryEF
    {
        private readonly MySqlDbContext _context;

        public CartRepositoryEF(MySqlDbContext context)
        {
            _context = context;
        }

        public async Task<Cart> GetCartByUserIdAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        public async Task AddToCartAsync(int userId, int productId, int quantity)
        {
            var cart = await GetCartByUserIdAsync(userId);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);

            if (item == null)
            {
                cart.Items.Add(new CartItem
                {
                    ProductId = productId,
                    Quantity = quantity
                });
            }
            else
            {
                item.Quantity += quantity;
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveFromCartAsync(int userId, int productId)
        {
            var cart = await GetCartByUserIdAsync(userId);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);

            if (item != null)
            {
                _context.CartItems.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
        public async Task UpdateSelectionAsync(int userId, int productId, bool isSelected)
        {
            var cart = await GetCartByUserIdAsync(userId);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null) return;

            item.IsSelected = isSelected;

            await _context.SaveChangesAsync();
        }
        public async Task SelectAllAsync(int userId, bool isSelected)
        {
            var cart = await GetCartByUserIdAsync(userId);

            foreach (var item in cart.Items)
            {
                item.IsSelected = isSelected;
            }

            await _context.SaveChangesAsync();
        }
        public async Task<List<CartItem>> GetSelectedItemsAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            return cart?.Items.Where(i => i.IsSelected).ToList() ?? new List<CartItem>();
        }
        public async Task IncreaseAsync(int userId, int productId)
        {
            var cart = await GetCartByUserIdAsync(userId);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null) return;

            item.Quantity += 1;

            await _context.SaveChangesAsync();
        }
        public async Task DecreaseAsync(int userId, int productId)
        {
            var cart = await GetCartByUserIdAsync(userId);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null) return;

            item.Quantity -= 1;

            // 👉 giống Shopee: về 0 thì xoá
            if (item.Quantity <= 0)
            {
                _context.CartItems.Remove(item);
            }

            await _context.SaveChangesAsync();
        }
    }
}
