using BaseCore.Entities;
using BaseCore.Services.Authen;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// API quản lý người dùng
    /// ✔ CRUD
    /// ✔ Search
    /// ✔ Pagination
    /// ✔ Role
    /// ✔ Active / Inactive
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(
            IUserService userService)
        {
            _userService = userService;
        }

        // =====================================================
        // GET ALL USERS + SEARCH + PAGINATION
        // GET /api/users?search=admin&page=1&pageSize=10
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            int page = 1,
            int pageSize = 10)
        {
            var result = await _userService.Search(
                search,
                page,
                pageSize);

            var items = result.Users.Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                u.Email,
                u.Phone,
                u.Address,
                u.Role,
                u.IsActive,
                u.CreatedAt
            });

            return Ok(new
            {
                items,
                totalCount = result.TotalCount,
                page,
                pageSize
            });
        }

        // =====================================================
        // GET USER BY ID
        // GET /api/users/1
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userService.GetById(id);

            if (user == null)
                return NotFound("Không tìm thấy user");

            return Ok(new
            {
                user.Id,
                user.Username,
                user.FullName,
                user.Email,
                user.Phone,
                user.Address,
                user.Role,
                user.IsActive,
                user.CreatedAt
            });
        }

        // =====================================================
        // ADD USER
        // POST /api/users
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Add(
            [FromBody] CreateUserRequest req)
        {
            if (req == null)
                return BadRequest("Dữ liệu không hợp lệ");

            var user = new User
            {
                Username = req.Username,
                FullName = req.FullName,
                Email = req.Email,
                Phone = req.Phone,
                Address = req.Address,
                Role = req.Role ?? "user",
                IsActive = true
            };

            var createdUser =
                await _userService.Create(
                    user,
                    req.Password);

            return Ok(new
            {
                message = "Tạo user thành công",
                userId = createdUser.Id
            });
        }

        // =====================================================
        // UPDATE USER
        // PUT /api/users/1
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateUserRequest req)
        {
            var existingUser =
                await _userService.GetById(id);

            if (existingUser == null)
                return NotFound("Không tìm thấy user");

            existingUser.FullName =
                req.FullName ?? existingUser.FullName;

            existingUser.Email =
                req.Email ?? existingUser.Email;

            existingUser.Phone =
                req.Phone ?? existingUser.Phone;

            existingUser.Address =
                req.Address ?? existingUser.Address;

            existingUser.Role =
                req.Role ?? existingUser.Role;

            existingUser.IsActive =
                req.IsActive ?? existingUser.IsActive;

            await _userService.Update(
                existingUser,
                req.Password);

            return Ok(new
            {
                message = "Cập nhật user thành công"
            });
        }

        // =====================================================
        // DELETE USER
        // DELETE /api/users/1
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user =
                await _userService.GetById(id);

            if (user == null)
                return NotFound("Không tìm thấy user");

            await _userService.Delete(id);

            return Ok(new
            {
                message = "Xóa user thành công"
            });
        }
    }

    // =====================================================
    // DTO CREATE USER
    // =====================================================
    public class CreateUserRequest
    {
        public string Username { get; set; } = "";

        public string Password { get; set; } = "";

        public string? FullName { get; set; }

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? Role { get; set; }
    }

    // =====================================================
    // DTO UPDATE USER
    // =====================================================
    public class UpdateUserRequest
    {
        public string? Password { get; set; }

        public string? FullName { get; set; }

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? Role { get; set; }

        public bool? IsActive { get; set; }
    }
}