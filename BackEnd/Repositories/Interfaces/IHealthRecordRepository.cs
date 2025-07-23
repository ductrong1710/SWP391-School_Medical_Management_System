using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IHealthRecordRepository
    {
        Task<IEnumerable<HealthRecord>> GetAllHealthRecordsAsync();
        Task<HealthRecord?> GetHealthRecordByIdAsync(string id);
        Task<HealthRecord?> GetHealthRecordByStudentIdAsync(string studentId);
        Task CreateHealthRecordAsync(HealthRecord healthRecord);
        Task UpdateHealthRecordAsync(HealthRecord healthRecord);
        Task DeleteHealthRecordAsync(string id);
        Task<bool> HealthRecordExistsAsync(string id);
    }
}