using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartRepositoryEF _cartRepository;
        private readonly MySqlDbContext _context;
        public CartController(ICartRepositoryEF cartRepository,MySqlDbContext context)
        {
            _cartRepository = cartRepository;
            _context = context;
        }

        // 👉 Lấy giỏ hàng
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetCart(int userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);

            var result = new
            {
                cart.Id,
                cart.UserId,
                items = cart.Items.Select(i => new
                {
                    i.ProductId,
                    i.Quantity,
                    productName = i.Product.Name,
                    price = i.Product.Price,
                    image = i.Product.Image
                })
            };

            return Ok(result);
        }

        // 👉 Thêm vào giỏ
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(int userId, int productId, int quantity = 1)
        {
            await _cartRepository.AddToCartAsync(userId, productId, quantity);
            return Ok(new { message = "Added to cart" });
        }

        // 👉 Xóa khỏi giỏ
        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFromCart(int userId, int productId)
        {
            await _cartRepository.RemoveFromCartAsync(userId, productId);
            return Ok(new { message = "Removed from cart" });
        }
        // Tích chọn sản phẩm
        [HttpPost("select")]
        public async Task<IActionResult> SelectItem(int userId, int productId, bool isSelected)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);

            if (item == null)
                return NotFound("Item not found");

            item.IsSelected = isSelected;

            await _context.SaveChangesAsync(); // ⚠️ cần inject DbContext

            return Ok(new { message = "Updated selection" });
        }
        //lấy sản phẩm đã chọn
        [HttpGet("selected/{userId}")]
        public async Task<IActionResult> GetSelectedItems(int userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);

            var selectedItems = cart.Items
                .Where(i => i.IsSelected)
                .Select(i => new
                {
                    i.ProductId,
                    i.Quantity,
                    i.Product.Name,
                    i.Product.Price
                });

            return Ok(selectedItems);
        }
        //Tạo đơn từ sản phẩm đã chọn
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout(int userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);

            var selectedItems = cart.Items.Where(i => i.IsSelected).ToList();

            if (!selectedItems.Any())
                return BadRequest("No selected items");

            var total = selectedItems.Sum(i => i.Quantity * i.Product.Price);

            // 👉 giả lập tạo order (bạn sẽ làm Order sau)
            var order = new
            {
                UserId = userId,
                Total = total,
                Items = selectedItems.Select(i => new
                {
                    i.ProductId,
                    i.Quantity,
                    i.Product.Price
                })
            };

            return Ok(order);
        }
        // Giam sp
        [HttpPost("decrease")]
        public async Task<IActionResult> Decrease(int userId, int productId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null) return NotFound();

            item.Quantity -= 1;

            if (item.Quantity <= 0)
            {
                _context.CartItems.Remove(item);
            }

            await _context.SaveChangesAsync();

            return Ok();
        }
        //Tang sp
        [HttpPost("increase")]
        public async Task<IActionResult> Increase(int userId, int productId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null) return NotFound();

            item.Quantity += 1;

            await _context.SaveChangesAsync();

            return Ok();
        }

    }
}
