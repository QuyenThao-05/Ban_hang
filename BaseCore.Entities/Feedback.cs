using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("Feedbacks")]
    public class Feedback
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string CustomerName { get; set; } = "";

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(255)]
        public string? Email { get; set; }

        public int? ProductId { get; set; }

        [MaxLength(255)]
        public string? ProductName { get; set; }

        public int? OrderId { get; set; }

        [MaxLength(50)]
        public string? OrderCode { get; set; }

        [Required]
        public string Content { get; set; } = "";

        [Required]
        public int Rating { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending | Approved | Replied | Hidden

        public string? AdminReply { get; set; }

        public DateTime? RepliedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }
    }
}