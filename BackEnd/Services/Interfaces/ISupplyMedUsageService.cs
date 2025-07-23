using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface ISupplyMedUsageService
    {
        Task<IEnumerable<SupplyMedUsage>> GetAllSupplyMedUsagesAsync();
        Task<SupplyMedUsage?> GetSupplyMedUsageByIdAsync(string id);
        Task<IEnumerable<SupplyMedUsage>> GetSupplyMedUsagesBySupplyIdAsync(string supplyId);
        Task<IEnumerable<SupplyMedUsage>> GetSupplyMedUsagesByMedicationIdAsync(string medicationId);
        Task<SupplyMedUsage> CreateSupplyMedUsageAsync(SupplyMedUsage supplyMedUsage);
        Task<SupplyMedUsage> UpdateSupplyMedUsageAsync(SupplyMedUsage supplyMedUsage);
        Task<bool> DeleteSupplyMedUsageAsync(string id);
    }
} 