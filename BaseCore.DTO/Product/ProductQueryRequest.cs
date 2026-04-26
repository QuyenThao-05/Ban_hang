using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.Product
{
    public class ProductQueryRequest
    {
        // Trang hiện tại
        public int Page { get; set; } = 1;

        // Số sản phẩm mỗi trang
        public int PageSize { get; set; } = 10;

        // Tìm kiếm tên sản phẩm
        public string Search { get; set; }

        // Lọc theo loại sản phẩm
        public int? ProductTypeId { get; set; }
    }
}