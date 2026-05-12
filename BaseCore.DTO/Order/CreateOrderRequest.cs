using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.Order
{
    public class CreateOrderRequest
    {
        public int UserId { get; set; }

        public string? ShippingAddress { get; set; }

        public string? PaymentMethod { get; set; }

        public List<CreateOrderDetailRequest> Items { get; set; } = new();
    }
}
