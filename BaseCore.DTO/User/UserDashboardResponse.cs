using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.User
{
    public class UserDashboardResponse
    {
        public int Id { get; set; }

        public string Username { get; set; } = "";

        public string? FullName { get; set; }

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string Role { get; set; } = "";

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
