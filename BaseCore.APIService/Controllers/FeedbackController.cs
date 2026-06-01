using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbacksController : ControllerBase
    {
        private readonly IFeedbackService _service;

        public FeedbacksController(IFeedbackService service)
        {
            _service = service;
        }

        // GET /api/feedbacks?search=&status=&rating=&page=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] int? rating,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _service.GetAll(search, status, rating, page, pageSize);

            return Ok(new
            {
                items = items.Select(f => new
                {
                    f.Id,
                    f.CustomerName,
                    f.Phone,
                    f.Email,
                    f.ProductId,
                    f.ProductName,
                    f.OrderId,
                    f.OrderCode,
                    f.Content,
                    f.Rating,
                    f.Status,
                    f.AdminReply,
                    f.RepliedAt,
                    f.CreatedAt,
                    f.UpdatedAt
                }),
                totalCount,
                page,
                pageSize
            });
        }

        // GET /api/feedbacks/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var f = await _service.GetById(id);
            if (f == null) return NotFound(new { message = "Không tìm thấy phản hồi" });
            return Ok(f);
        }

        // PUT /api/feedbacks/1/reply
        [HttpPut("{id}/reply")]
        [Authorize]
        public async Task<IActionResult> Reply(int id, [FromBody] ReplyRequest req)
        {
            var replyText = req?.AdminReply ?? req?.Reply;

            if (string.IsNullOrWhiteSpace(replyText))
            {
                return BadRequest(new { message = "Nội dung phản hồi không được để trống" });
            }

            try
            {
                await _service.Reply(id, replyText.Trim());

                return Ok(new { message = "Phản hồi thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/feedbacks/1/status
        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusRequest req)
        {
            if (string.IsNullOrEmpty(req?.Status))
                return BadRequest(new { message = "Trạng thái không hợp lệ" });

            try
            {
                await _service.UpdateStatus(id, req.Status);
                return Ok(new { message = "Cập nhật trạng thái thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/feedbacks/1
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.Delete(id);
                return Ok(new { message = "Xóa thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class ReplyRequest
    {
        public string? Reply { get; set; }
        public string? AdminReply { get; set; }
    }

    public class StatusRequest
    {
        public string Status { get; set; } = "";
    }
}