using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    public class ProductDetail
    {
        // PRIMARY KEY
        public int Id { get; set; }

        // PRODUCT
        public int ProductId { get; set; }

        public Product? Product { get; set; }

        // PRODUCT INFO
        public string? Description { get; set; }

        public string? Detail { get; set; }

        public string? Brand { get; set; }

        public string? Color { get; set; }

        public string? Size { get; set; }

        public int Quantity { get; set; }

        // NAVIGATION
        public List<OrderDetail> OrderDetails { get; set; }
            = new();
    }
}