using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Services.Authen;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.AuthService.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll(string keyword = "", int page = 1, int pageSize = 10)
        {
            var (users, totalCount) = await _userService.Search(keyword, page, pageSize);

            var result = users.Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                u.Email,
                u.Phone,
                u.Role,
                u.CreatedAt
            });

            return Ok(new
            {
                data = result,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }
        // lấy theo id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userService.GetById(id);
            if (user == null)
                return NotFound("User not found");

            return Ok(new
            {
                user.Id,
                user.Username,
                user.FullName,
                user.Email,
                user.Phone,
                user.Role,
                user.CreatedAt
            });
        }
        //Tạo user
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Username và Password là bắt buộc");

            var user = await _userService.Create(request, request.Password);

            return Ok(user);
        }
        //update user
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] User request)
        {
            var existingUser = await _userService.GetById(id);
            if (existingUser == null)
                return NotFound("User not found");

            existingUser.FullName = request.FullName ?? existingUser.FullName;
            existingUser.Email = request.Email ?? existingUser.Email;
            existingUser.Phone = request.Phone ?? existingUser.Phone;
            existingUser.Role = request.Role ?? existingUser.Role;

            await _userService.Update(existingUser, request.Password);

            return Ok(existingUser);
        }
        //xoa user
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _userService.GetById(id);
            if (user == null)
                return NotFound("User not found");

            await _userService.Delete(id);

            return Ok("Deleted");
        }
    }

    public class UserResponse
    {
        public int Id { get; set; }

        public string Username { get; set; }

        public string FullName { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public string Role { get; set; }

        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; }

        public string Password { get; set; }

        public string FullName { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public string Role { get; set; }
    }

    public class UpdateUserRequest
    {
        public string Password { get; set; }

        public string FullName { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public string Role { get; set; }
    }
}
