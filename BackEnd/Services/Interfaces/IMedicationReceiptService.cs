using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IMedicationReceiptService
    {
        Task<IEnumerable<MedicationReceipt>> GetAllMedicationReceiptsAsync();
        Task<MedicationReceipt?> GetMedicationReceiptByIdAsync(string id);
        Task<IEnumerable<MedicationReceipt>> GetMedicationReceiptsByFormIdAsync(string formId);
        Task<IEnumerable<MedicationReceipt>> GetMedicationReceiptsByParentIdAsync(string parentId);
        Task<IEnumerable<MedicationReceipt>> GetMedicationReceiptsByMedicalStaffIdAsync(string medicalStaffId);
        Task<MedicationReceipt> CreateMedicationReceiptAsync(MedicationReceipt medicationReceipt);
        Task<MedicationReceipt> UpdateMedicationReceiptAsync(MedicationReceipt medicationReceipt);
        Task<bool> DeleteMedicationReceiptAsync(string id);
    }
} 