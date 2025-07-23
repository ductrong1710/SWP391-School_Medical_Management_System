using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IHealthRecordService
    {
        Task<IEnumerable<HealthRecord>> GetAllHealthRecordsAsync();
        Task<HealthRecord?> GetHealthRecordByIdAsync(string id);
        Task<HealthRecord?> GetHealthRecordByStudentIdAsync(string studentId);
        Task<HealthRecord> CreateHealthRecordAsync(HealthRecord healthRecord);
        Task UpdateHealthRecordAsync(string id, HealthRecord healthRecord);
        Task DeleteHealthRecordAsync(string id);
    }
}