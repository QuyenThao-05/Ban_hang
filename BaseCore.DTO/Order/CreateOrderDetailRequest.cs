using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.Order
{
    public class CreateOrderDetailRequest
    {
        public int ProductId { get; set; }

        public int? ProductDetailId { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }
    }
}
