using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class MedicalSupplyService : IMedicalSupplyService
    {
        private readonly IMedicalSupplyRepository _repository;

        public MedicalSupplyService(IMedicalSupplyRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MedicalSupply>> GetAllSuppliesAsync()
        {
            return await _repository.GetAllSuppliesAsync();
        }

        public async Task<MedicalSupply?> GetSupplyByIdAsync(string id)
        {
            return await _repository.GetSupplyByIdAsync(id);
        }

        public async Task<MedicalSupply> AddSupplyAsync(MedicalSupply supply)
        {
            return await _repository.AddSupplyAsync(supply);
        }

        public async Task UpdateSupplyAsync(string id, MedicalSupply supply)
        {
            if (id != supply.SupplyID)
            {
                throw new ArgumentException("ID mismatch");
            }

            var exists = await _repository.SupplyExistsAsync(id);
            if (!exists)
            {
                throw new KeyNotFoundException($"Supply with ID {id} not found");
            }

            await _repository.UpdateSupplyAsync(supply);
        }

        public async Task DeleteSupplyAsync(string id)
        {
            var exists = await _repository.SupplyExistsAsync(id);
            if (!exists)
            {
                throw new KeyNotFoundException($"Supply with ID {id} not found");
            }

            await _repository.DeleteSupplyAsync(id);
        }
    }
}