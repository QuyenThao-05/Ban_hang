using BaseCore.DTO.Review;
using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Repository.EFCore
{
    public interface IReviewRepositoryEF : IRepository<Review>
    {
        Task<(List<Review> Reviews, int TotalCount)> GetByProductIdAsync(
            int productId,
            int page,
            int pageSize);

        Task<ReviewSummaryResponse> GetSummaryAsync(
            int productId);
    }

    public class ReviewRepositoryEF
        : Repository<Review>,
          IReviewRepositoryEF
    {
        public ReviewRepositoryEF(
            MySqlDbContext context)
            : base(context)
        {
        }

        // =====================================================
        // GET REVIEWS BY PRODUCT
        // =====================================================
        public async Task<(List<Review> Reviews, int TotalCount)>
            GetByProductIdAsync(
                int productId,
                int page,
                int pageSize)
        {
            var query = _dbSet
                .Include(r => r.User)
                .Where(r => r.ProductId == productId);

            var totalCount =
                await query.CountAsync();

            var reviews =
                await query
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

            return (reviews, totalCount);
        }

        // =====================================================
        // REVIEW SUMMARY
        // =====================================================
        public async Task<ReviewSummaryResponse>
            GetSummaryAsync(int productId)
        {
            var reviews = await _dbSet
                .Where(r => r.ProductId == productId)
                .ToListAsync();

            if (!reviews.Any())
            {
                return new ReviewSummaryResponse();
            }

            return new ReviewSummaryResponse
            {
                AverageRating =
                    Math.Round(
                        (decimal)reviews.Average(r => r.Rating),
                        1),

                TotalReviews = reviews.Count,

                FiveStar = reviews.Count(r => r.Rating == 5),
                FourStar = reviews.Count(r => r.Rating == 4),
                ThreeStar = reviews.Count(r => r.Rating == 3),
                TwoStar = reviews.Count(r => r.Rating == 2),
                OneStar = reviews.Count(r => r.Rating == 1)
            };
        }
    }
}