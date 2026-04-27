using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.Bill
{
    public class BillDashboardResponse
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string CustomerName { get; set; } = "";

        public decimal TotalPrice { get; set; }

        public string Status { get; set; } = "";

        public string? ShippingAddress { get; set; }

        public string? PaymentMethod { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
