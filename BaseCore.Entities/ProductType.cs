using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("ProductType")]
    public class ProductType
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public List<Product> Products { get; set; } = new();

    }
}