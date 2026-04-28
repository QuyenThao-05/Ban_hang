using BaseCore.DTO.Review;
using BaseCore.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Product Reviews API
    /// </summary>
    [Route("api/reviews")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(
            IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // =====================================================
        // GET REVIEWS BY PRODUCT
        // GET: api/reviews/product/15?page=1&pageSize=5
        // =====================================================
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProduct(
            int productId,
            int page = 1,
            int pageSize = 5)
        {
            var result =
                await _reviewService.GetByProductId(
                    productId,
                    page,
                    pageSize);

            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page,
                pageSize
            });
        }

        // =====================================================
        // GET REVIEW SUMMARY
        // GET: api/reviews/product/15/summary
        // =====================================================
        [HttpGet("product/{productId}/summary")]
        public async Task<IActionResult> GetSummary(
            int productId)
        {
            var summary =
                await _reviewService.GetSummary(
                    productId);

            return Ok(summary);
        }

        // =====================================================
        // ADD REVIEW
        // POST: api/reviews
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> AddReview(
            [FromBody]
            CreateReviewRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message =
                        "Dữ liệu không hợp lệ"
                });
            }

            try
            {
                var review =
                    await _reviewService.AddReview(
                        request);

                return Ok(new
                {
                    message =
                        "Đánh giá thành công",
                    review
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}