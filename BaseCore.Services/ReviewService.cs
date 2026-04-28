using BaseCore.DTO.Review;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public interface IReviewService
    {
        Task<(List<ReviewResponse> Items, int TotalCount)>
            GetByProductId(
                int productId,
                int page,
                int pageSize);

        Task<ReviewSummaryResponse>
            GetSummary(int productId);

        Task<ReviewResponse>
            AddReview(CreateReviewRequest request);
    }

    public class ReviewService : IReviewService
    {
        private readonly IReviewRepositoryEF _reviewRepository;

        public ReviewService(
            IReviewRepositoryEF reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        // =====================================================
        // GET REVIEWS
        // =====================================================
        public async Task<(List<ReviewResponse> Items, int TotalCount)>
            GetByProductId(
                int productId,
                int page,
                int pageSize)
        {
            var (reviews, totalCount) =
                await _reviewRepository.GetByProductIdAsync(
                    productId,
                    page,
                    pageSize);

            var items = reviews.Select(r =>
                new ReviewResponse
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    UserId = r.UserId,
                    UserName =
                        r.User.FullName ??
                        r.User.Username,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList();

            return (items, totalCount);
        }

        // =====================================================
        // REVIEW SUMMARY
        // =====================================================
        public async Task<ReviewSummaryResponse>
            GetSummary(int productId)
        {
            return await _reviewRepository
                .GetSummaryAsync(productId);
        }

        // =====================================================
        // ADD REVIEW
        // =====================================================
        public async Task<ReviewResponse>
            AddReview(CreateReviewRequest request)
        {
            if (request.Rating < 1 || request.Rating > 5)
            {
                throw new Exception(
                    "Rating phải từ 1 đến 5");
            }

            var review = new Review
            {
                ProductId = request.ProductId,
                UserId = request.UserId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.Now
            };

            await _reviewRepository.AddAsync(review);

            return new ReviewResponse
            {
                Id = review.Id,
                ProductId = review.ProductId,
                UserId = review.UserId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }
    }
}