using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.ProductType
{
    public class ProductTypeCreateRequest
    {
        public string Name { get; set; }

        public string? Description { get; set; }
    }
}