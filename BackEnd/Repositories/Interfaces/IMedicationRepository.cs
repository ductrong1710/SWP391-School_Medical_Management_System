using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IMedicationRepository
    {
        Task<IEnumerable<Medication>> GetAllMedicationsAsync();
        Task<Medication?> GetMedicationByIdAsync(string id);
        Task<IEnumerable<Medication>> GetExpiredMedicationsAsync();
        Task<IEnumerable<Medication>> GetLowStockMedicationsAsync(int threshold = 10);
        Task CreateMedicationAsync(Medication medication);
        Task UpdateMedicationAsync(Medication medication);
        Task DeleteMedicationAsync(string id);
        Task<bool> MedicationExistsAsync(string id);
    }
}