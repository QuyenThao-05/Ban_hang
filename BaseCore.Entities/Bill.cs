
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    public class Bill
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }

        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = "Pending";

        public string? ShippingAddress { get; set; }

        public string? PaymentMethod { get; set; }

        public DateTime CreatedAt { get; set; }

        public List<BillDetail> BillDetails { get; set; } = new();
    }
}
