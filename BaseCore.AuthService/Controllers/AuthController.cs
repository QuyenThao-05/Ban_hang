using BaseCore.DTO.User;
using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using BaseCore.Services;
using BaseCore.Services.Authen;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly MySqlDbContext _context;

        public AuthController(
            IUserService userService,
            IConfiguration configuration,
            MySqlDbContext context)
        {
            _userService = userService;
            _configuration = configuration;
            _context = context;
        }

        // 🔥 LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Thiếu username hoặc password");

            var user = await _userService.Authenticate(request.Username, request.Password);

            if (user == null)
                return Unauthorized("Sai tài khoản hoặc mật khẩu");

            // ✅ Generate JWT thật
            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token = token,
                role = user.Role,
                userId = user.Id,
                username = user.Username
            });
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id.ToString() == userId);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                role = user.Role
            });
        }

        [Authorize]
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id.ToString() == userId);

            if (user == null)
                return NotFound();

            user.Username = dto.Username;
            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Phone = dto.Phone;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật thành công"
            });
        }

        // 🔥 REGISTER
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null)
                return BadRequest("Request không hợp lệ");

            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Username và Password là bắt buộc");

            if (request.Password.Length < 6)
                return BadRequest("Password phải >= 6 ký tự");

            var user = new User
            {
                Username = request.Username,
                FullName = string.IsNullOrEmpty(request.FullName) ? request.Username : request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                Role = "user"
            };

            var createdUser = await _userService.Create(user, request.Password);

            return Ok(new
            {
                message = "Đăng ký thành công",
                userId = createdUser.Id,
                username = createdUser.Username
            });
        }

        // ✅ Generate JWT Token
        private string GenerateJwtToken(User user)
        {
            var secretKey = _configuration["Jwt:SecretKey"] ?? "YourSecretKeyForAuthenticationShouldBeLongEnough";
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role ?? "user"),
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // 🔥 LOGIN REQUEST
    public class LoginRequest
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }

    // 🔥 REGISTER REQUEST
    public class RegisterRequest
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }
}