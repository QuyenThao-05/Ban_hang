
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }

        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = "Pending";

        public string? ShippingAddress { get; set; }

        public string? PaymentMethod { get; set; }

        public DateTime CreatedAt { get; set; }

        public List<OrderDetail> OrderDetails { get; set; } = new();
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }

        public decimal DiscountAmount { get; set; } = 0;
        public decimal ShippingFee { get; set; } = 0;
        public decimal FinalAmount { get; set; } = 0;

        public string PaymentStatus { get; set; } = "Unpaid";

        public string? Note { get; set; }
        public string? CancelReason { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
    }
}
