using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IVaccineTypeRepository
    {
        Task<IEnumerable<VaccineType>> GetAllVaccineTypesAsync();
        Task<VaccineType?> GetVaccineTypeByIdAsync(string id);
        Task CreateVaccineTypeAsync(VaccineType vaccineType);
        Task UpdateVaccineTypeAsync(VaccineType vaccineType);
        Task DeleteVaccineTypeAsync(string id);
        Task<bool> VaccineTypeExistsAsync(string id);
        Task<bool> VaccineTypeExistsByNameAsync(string name);
    }
}