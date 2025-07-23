using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IMedicationReceiptRepository
    {
        Task<IEnumerable<MedicationReceipt>> GetAllAsync();
        Task<MedicationReceipt?> GetByIdAsync(string id);
        Task<IEnumerable<MedicationReceipt>> GetByFormIdAsync(string formId);
        Task<IEnumerable<MedicationReceipt>> GetByParentIdAsync(string parentId);
        Task<IEnumerable<MedicationReceipt>> GetByMedicalStaffIdAsync(string medicalStaffId);
        Task<MedicationReceipt> AddAsync(MedicationReceipt medicationReceipt);
        Task<MedicationReceipt> UpdateAsync(MedicationReceipt medicationReceipt);
        Task<bool> DeleteAsync(string id);
    }
} 