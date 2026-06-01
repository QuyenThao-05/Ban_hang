using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public interface IFeedbackService
    {
        Task<(List<Feedback> Items, int TotalCount)> GetAll(
            string? search, string? status, int? rating, int page, int pageSize);
        Task<Feedback?> GetById(int id);
        Task Reply(int id, string reply);
        Task UpdateStatus(int id, string status);
        Task Delete(int id);
    }

    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepository _repository;

        public FeedbackService(IFeedbackRepository repository)
        {
            _repository = repository;
        }

        public async Task<(List<Feedback> Items, int TotalCount)> GetAll(
            string? search, string? status, int? rating, int page, int pageSize)
            => await _repository.GetAllAsync(search, status, rating, page, pageSize);

        public async Task<Feedback?> GetById(int id)
            => await _repository.GetByIdAsync(id);

        public async Task Reply(int id, string reply)
        {
            var feedback = await _repository.GetByIdAsync(id);

            if (feedback == null)
            {
                throw new Exception("Không tìm thấy phản hồi");
            }

            if (string.IsNullOrWhiteSpace(reply))
            {
                throw new Exception("Vui lòng nhập nội dung phản hồi của admin");
            }

            feedback.AdminReply = reply.Trim();
            feedback.RepliedAt = DateTime.Now;
            feedback.UpdatedAt = DateTime.Now;
            feedback.Status = "Replied";

            await _repository.UpdateAsync(feedback);
        }
        public async Task UpdateStatus(int id, string status)
        {
            var allowed = new[]
            {
                "Pending",
                "Approved",
                "Replied",
                "Hidden"
            };

            if (!allowed.Contains(status))
            {
                throw new Exception("Trạng thái không hợp lệ");
            }

            var feedback = await _repository.GetByIdAsync(id);

            if (feedback == null)
            {
                throw new Exception("Không tìm thấy phản hồi");
            }

            feedback.Status = status;
            feedback.UpdatedAt = DateTime.Now;

            await _repository.UpdateAsync(feedback);
        }

        public async Task Delete(int id)
            => await _repository.DeleteAsync(id);
    }
}