using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IMedicalSupplyService
    {
        Task<IEnumerable<MedicalSupply>> GetAllSuppliesAsync();
        Task<MedicalSupply?> GetSupplyByIdAsync(string id);
        Task<MedicalSupply> AddSupplyAsync(MedicalSupply supply);
        Task UpdateSupplyAsync(string id, MedicalSupply supply);
        Task DeleteSupplyAsync(string id);
    }
}