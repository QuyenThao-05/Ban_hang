using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.Entities
{
    public class Cart
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public List<CartItem> Items { get; set; } = new();
    }
}

