using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.Feedback
{
    public class CreateFeedback
    {
        public string CustomerName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }

        public int? ProductId { get; set; }
        public string ProductName { get; set; }

        public int? OrderId { get; set; }
        public string OrderCode { get; set; }

        public string Content { get; set; }
        public int Rating { get; set; }
    }
}
