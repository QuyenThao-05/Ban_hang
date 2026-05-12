using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public interface IManufacturerService
    {
        Task<(List<Manufacturer> Items, int TotalCount)> GetAll(string? search, int page, int pageSize);
        Task<Manufacturer?> GetById(int id);
        Task<Manufacturer> Create(Manufacturer manufacturer);
        Task Update(Manufacturer manufacturer);
        Task Delete(int id);
    }

    public class ManufacturerService : IManufacturerService
    {
        private readonly IManufacturerRepository _repository;

        public ManufacturerService(IManufacturerRepository repository)
        {
            _repository = repository;
        }

        public async Task<(List<Manufacturer> Items, int TotalCount)> GetAll(
            string? search, int page, int pageSize)
        {
            return await _repository.GetAllAsync(search, page, pageSize);
        }

        public async Task<Manufacturer?> GetById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Manufacturer> Create(Manufacturer manufacturer)
        {
            if (string.IsNullOrEmpty(manufacturer.Name))
                throw new Exception("Tên không được để trống");

            return await _repository.CreateAsync(manufacturer);
        }

        public async Task Update(Manufacturer manufacturer)
        {
            if (string.IsNullOrEmpty(manufacturer.Name))
                throw new Exception("Tên không được để trống");

            await _repository.UpdateAsync(manufacturer);
        }

        public async Task Delete(int id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}