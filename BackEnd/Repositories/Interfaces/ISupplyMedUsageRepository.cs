using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface ISupplyMedUsageRepository
    {
        Task<IEnumerable<SupplyMedUsage>> GetAllAsync();
        Task<SupplyMedUsage?> GetByIdAsync(string id);
        Task<IEnumerable<SupplyMedUsage>> GetBySupplyIdAsync(string supplyId);
        Task<IEnumerable<SupplyMedUsage>> GetByMedicationIdAsync(string medicationId);
        Task<SupplyMedUsage> AddAsync(SupplyMedUsage supplyMedUsage);
        Task<SupplyMedUsage> UpdateAsync(SupplyMedUsage supplyMedUsage);
        Task<bool> DeleteAsync(string id);
    }
} 