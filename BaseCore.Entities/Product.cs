using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("Product")]
    public class Product
    {
        public int Id { get; set; }

        public string? Name { get; set; }

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public string? Image { get; set; }
        public string? Description { get; set; }

        public string? Detail { get; set; }
        public int ProductTypeId { get; set; }

        public DateTime CreatedAt { get; set; }

        public int ManufacturerId { get; set; }
        public ProductType? ProductType { get; set; }
        public List<BillDetail> BillDetails { get; set; } = new();
        public List<ProductDetail> ProductDetails { get; set; } = new();

    }
}
