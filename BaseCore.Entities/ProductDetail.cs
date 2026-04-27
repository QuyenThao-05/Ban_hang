using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

    namespace BaseCore.Entities
    {
        public class ProductDetail
        {
            // =====================================================
            // PRIMARY KEY
            // =====================================================
            public int Id { get; set; }

            // =====================================================
            // PRODUCT
            // =====================================================
            public int ProductId { get; set; }

            public Product Product { get; set; }

            // =====================================================
            // PRODUCT INFO
            // =====================================================
            public string? Description { get; set; }

            public string? Brand { get; set; }

            public string? Color { get; set; }

            public string? Size { get; set; }

            public int Quantity { get; set; }

            // =====================================================
            // NAVIGATION
            // =====================================================
            public List<BillDetail> BillDetails { get; set; } = new();
        }
    }
