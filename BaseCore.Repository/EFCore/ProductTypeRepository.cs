using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.Repository.EFCore
{
    public interface IProductTypeRepositoryEF : IRepository<ProductType>
    {
        Task<(List<ProductType> Items, int TotalCount)> SearchAsync(
            string? keyword,
            int page,
            int pageSize);

    }
    public class ProductTypeRepositoryEF
    : Repository<ProductType>, IProductTypeRepositoryEF
    {
        public ProductTypeRepositoryEF(MySqlDbContext context)
            : base(context)
        {
        }

        public async Task<(List<ProductType> Items, int TotalCount)> SearchAsync(
            string? keyword,
            int page,
            int pageSize)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(x =>
                    x.Name.Contains(keyword));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(x => x.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
