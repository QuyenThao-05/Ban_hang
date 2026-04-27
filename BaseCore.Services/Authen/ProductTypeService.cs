using BaseCore.DTO.ProductType;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public class ProductTypeService
    {
        private readonly IProductTypeRepositoryEF _repository;

        public ProductTypeService(
            IProductTypeRepositoryEF repository)
        {
            _repository = repository;
        }

        public async Task<(List<ProductTypeDashboardResponse> Items, int TotalCount)> GetAll(
            string? keyword,
            int page,
            int pageSize)
        {
            var (items, totalCount) = await _repository.SearchAsync(
                keyword,
                page,
                pageSize);

            var result = items.Select(x =>
                new ProductTypeDashboardResponse
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description
                }).ToList();

            return (result, totalCount);
        }

        public async Task<ProductType> Add(
            ProductTypeCreateRequest req)
        {
            var entity = new ProductType
            {
                Name = req.Name,
                Description = req.Description
            };

            await _repository.AddAsync(entity);

            return entity;
        }

        public async Task<ProductType?> Update(
            int id,
            ProductTypeUpdateRequest req)
        {
            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
                return null;

            entity.Name = req.Name;
            entity.Description = req.Description;

            await _repository.UpdateAsync(entity);

            return entity;
        }

        public async Task Delete(int id)
        {
            var entity = await _repository.GetByIdAsync(id);

            if (entity != null)
            {
                await _repository.DeleteAsync(entity);
            }
        }
    }
}