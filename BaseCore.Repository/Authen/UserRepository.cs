using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace BaseCore.Repository.Authen
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByIdAsync(int id);
        Task<List<User>> GetAllAsync();
        Task CreateAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(int id);
        Task<(List<User> Users, int TotalCount)> SearchAsync(string? keyword, int page, int pageSize);
    }

    public class UserRepository : IUserRepository
    {
        private readonly MySqlDbContext _context;

        public UserRepository(MySqlDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task CreateAsync(User user)
        {
            user.CreatedAt = DateTime.Now;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return;

            // ✅ Xóa các bảng liên quan trước bằng raw SQL
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM Reviews WHERE UserId = {0}", id);

            // CartItems xóa qua Carts
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE ci FROM CartItems ci INNER JOIN Carts c ON ci.CartId = c.Id WHERE c.UserId = {0}", id);
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM Carts WHERE UserId = {0}", id);

            // Xóa OrderDetails của các Orders thuộc user này
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE od FROM OrderDetails od INNER JOIN Orders o ON od.OrderId = o.Id WHERE o.UserId = {0}", id);
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM Orders WHERE UserId = {0}", id);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<(List<User> Users, int TotalCount)> SearchAsync(
            string? keyword,
            int page,
            int pageSize)
        {
            var query = _context.Users.AsQueryable();
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();

                query = query.Where(u =>
                    u.Username.ToLower().Contains(keyword) ||

                    (u.FullName != null &&
                     u.FullName.ToLower().Contains(keyword)) ||

                    (u.Email != null &&
                     u.Email.ToLower().Contains(keyword)) ||

                    (u.Phone != null &&
                     u.Phone.ToLower().Contains(keyword))
                );
            }

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (users, totalCount);
        }
    }
}