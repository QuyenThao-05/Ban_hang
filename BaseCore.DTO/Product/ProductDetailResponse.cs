using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.Product
{
    namespace BaseCore.DTO.Product
    {
        public class ProductDetailResponse
        {
            public int Id { get; set; }

            public string Name { get; set; } = "";

            public decimal Price { get; set; }

            public int Quantity { get; set; }

            public string? Image { get; set; }

            public string? Description { get; set; }

            public string? Detail { get; set; }

            public int ProductTypeId { get; set; }

            public string ProductTypeName { get; set; } = "";

            public List<ProductVariantResponse> Variants { get; set; } = new();
        }

        public class ProductVariantResponse
        {
            public int Id { get; set; }

            public string? Brand { get; set; }

            public string? Color { get; set; }

            public string? Size { get; set; }

            public int Quantity { get; set; }
        }
    }
}
