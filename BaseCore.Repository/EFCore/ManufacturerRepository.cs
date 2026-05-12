using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;
using BaseCore.Repository.EFCore;

namespace BaseCore.Repository.EFCore
{
    public interface IManufacturerRepository
    {
        Task<(List<Manufacturer> Items, int TotalCount)> GetAllAsync(string? search, int page, int pageSize);
        Task<Manufacturer?> GetByIdAsync(int id);
        Task<Manufacturer> CreateAsync(Manufacturer manufacturer);
        Task UpdateAsync(Manufacturer manufacturer);
        Task DeleteAsync(int id);
    }

    public class ManufacturerRepository : IManufacturerRepository
    {
        private readonly MySqlDbContext _context;

        public ManufacturerRepository(MySqlDbContext context)
        {
            _context = context;
        }

        public async Task<(List<Manufacturer> Items, int TotalCount)> GetAllAsync(
            string? search,
            int page,
            int pageSize)
        {
            var query = _context.Manufacturers.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(m =>
                    m.Name.ToLower().Contains(search) ||
                    (m.Phone != null && m.Phone.Contains(search)) ||
                    (m.Address != null && m.Address.ToLower().Contains(search))
                );
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(m => m.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Manufacturer?> GetByIdAsync(int id)
        {
            return await _context.Manufacturers.FindAsync(id);
        }

        public async Task<Manufacturer> CreateAsync(Manufacturer manufacturer)
        {
            var existing = await _context.Manufacturers
                .FirstOrDefaultAsync(m => m.Name.ToLower() == manufacturer.Name.ToLower());

            if (existing != null)
                throw new Exception("Tên nhà sản xuất đã tồn tại");

            _context.Manufacturers.Add(manufacturer);
            await _context.SaveChangesAsync();
            return manufacturer;
        }

        public async Task UpdateAsync(Manufacturer manufacturer)
        {
            var existing = await _context.Manufacturers.FindAsync(manufacturer.Id);
            if (existing == null)
                throw new Exception("Không tìm thấy nhà sản xuất");

            existing.Name = manufacturer.Name;
            existing.Address = manufacturer.Address;
            existing.Phone = manufacturer.Phone;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var manufacturer = await _context.Manufacturers.FindAsync(id);
            if (manufacturer == null)
                throw new Exception("Không tìm thấy nhà sản xuất");

            var products = await _context.Products
                .Where(p => p.ManufacturerId == id)
                .ToListAsync();

            foreach (var product in products)
            {
                product.ManufacturerId = null;
            }

            _context.Manufacturers.Remove(manufacturer);
            await _context.SaveChangesAsync();
        }
    }
}