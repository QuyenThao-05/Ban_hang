namespace BaseCore.Entities
{
    public class OrderDetail
    {
        // =====================================================
        // PRIMARY KEY
        // =====================================================
        public int Id { get; set; }

        // =====================================================
        // BILL FOREIGN KEY
        // =====================================================
        public int OrderId { get; set; }

        public Order Order { get; set; }

        // =====================================================
        // PRODUCT FOREIGN KEY
        // =====================================================
        public int ProductId { get; set; }

        public Product Product { get; set; }

        // =====================================================
        // PRODUCT DETAIL FOREIGN KEY (Variant)
        // =====================================================
        public int? ProductDetailId { get; set; }

        public ProductDetail? ProductDetail { get; set; }

        // =====================================================
        // ORDER INFO
        // =====================================================
        public int Quantity { get; set; }

        public decimal Price { get; set; }

        public decimal TotalPrice { get; set; }
    }
}