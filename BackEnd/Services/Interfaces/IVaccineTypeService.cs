using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IVaccineTypeService
    {
        Task<IEnumerable<VaccineType>> GetAllVaccineTypesAsync();
        Task<VaccineType?> GetVaccineTypeByIdAsync(string id);
        Task<VaccineType> CreateVaccineTypeAsync(VaccineType vaccineType);
        Task UpdateVaccineTypeAsync(string id, VaccineType vaccineType);
        Task DeleteVaccineTypeAsync(string id);
    }
}