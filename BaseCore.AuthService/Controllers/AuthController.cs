using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.Services;
using BaseCore.Services.Authen;
using Microsoft.AspNetCore.Mvc;
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

        public AuthController(IUserService userService, IConfiguration configuration)
        {
            _userService = userService;
            _configuration = configuration;
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
                username = user.Username
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