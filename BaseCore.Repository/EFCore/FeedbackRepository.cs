using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Repository.EFCore
{
    public interface IFeedbackRepository
    {
        Task<(List<Feedback> Items, int TotalCount)> GetAllAsync(
            string? search, string? status, int? rating, int page, int pageSize);
        Task<Feedback?> GetByIdAsync(int id);
        Task UpdateAsync(Feedback feedback);
        Task DeleteAsync(int id);
    }

    public class FeedbackRepository : IFeedbackRepository
    {
        private readonly MySqlDbContext _context;

        public FeedbackRepository(MySqlDbContext context)
        {
            _context = context;
        }

        public async Task<(List<Feedback> Items, int TotalCount)> GetAllAsync(
            string? search, string? status, int? rating, int page, int pageSize)
        {
            var query = _context.Feedbacks.AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(f =>
                    EF.Functions.Like(f.CustomerName, $"%{search}%") ||
                    (f.Phone != null && EF.Functions.Like(f.Phone, $"%{search}%")) ||
                    (f.ProductName != null && EF.Functions.Like(f.ProductName, $"%{search}%")) ||
                    (f.OrderCode != null && EF.Functions.Like(f.OrderCode, $"%{search}%"))
                );

            if (!string.IsNullOrEmpty(status))
                query = query.Where(f => f.Status == status);

            if (rating.HasValue)
                query = query.Where(f => f.Rating == rating.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(f => f.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Feedback?> GetByIdAsync(int id)
            => await _context.Feedbacks.FindAsync(id);

        public async Task UpdateAsync(Feedback feedback)
        {
            var existing = await _context.Feedbacks.FindAsync(feedback.Id);
            if (existing == null)
                throw new Exception("Không tìm thấy phản hồi");

            existing.Status = feedback.Status;
            existing.AdminReply = feedback.AdminReply;
            existing.RepliedAt = feedback.RepliedAt;
            existing.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
                throw new Exception("Không tìm thấy phản hồi");

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
        }
    }
}