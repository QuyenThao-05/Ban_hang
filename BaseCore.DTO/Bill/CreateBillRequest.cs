using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.Bill
{
    public class CreateBillRequest
    {
        public int UserId { get; set; }

        public string? ShippingAddress { get; set; }

        public string? PaymentMethod { get; set; }

        public List<CreateBillDetailRequest> Items { get; set; } = new();
    }
}
