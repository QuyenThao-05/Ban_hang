using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("Coupons")]
    public class Coupon
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = "";

        [MaxLength(255)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(20)]
        public string DiscountType { get; set; } = "Percent"; // Percent | Fixed

        [Required]
        public decimal DiscountValue { get; set; }

        public decimal MinOrderValue { get; set; } = 0;

        public int MaxUses { get; set; } = 0; // 0 = không giới hạn

        public int UsedCount { get; set; } = 0;

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}