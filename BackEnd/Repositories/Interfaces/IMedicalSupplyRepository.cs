using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IMedicalSupplyRepository
    {
        Task<IEnumerable<MedicalSupply>> GetAllSuppliesAsync();
        Task<MedicalSupply?> GetSupplyByIdAsync(string id);
        Task<MedicalSupply> AddSupplyAsync(MedicalSupply supply);
        Task UpdateSupplyAsync(MedicalSupply supply);
        Task DeleteSupplyAsync(string id);
        Task<bool> SupplyExistsAsync(string id);
    }
}