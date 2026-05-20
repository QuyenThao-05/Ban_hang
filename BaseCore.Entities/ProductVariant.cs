using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("ProductVariants")]
    public class ProductVariant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [StringLength(255)]
        public string? VariantName { get; set; }

        [StringLength(50)]
        public string? Color { get; set; }

        [StringLength(50)]
        public string? Size { get; set; }

        [Required]
        public decimal Price { get; set; }

        public int Stock { get; set; }

        [StringLength(500)]
        public string? ImageUrl { get; set; }

        [StringLength(100)]
        public string? SKU { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }

        // Navigation
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
}