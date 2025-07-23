using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IMedicationSubmissionFormRepository
    {
        Task<IEnumerable<MedicationSubmissionForm>> GetAllFormsAsync();
        Task<MedicationSubmissionForm?> GetFormByIdAsync(string id);
        Task<IEnumerable<MedicationSubmissionForm>> GetFormsByStudentIdAsync(string studentId);
        Task CreateFormAsync(MedicationSubmissionForm form);
        Task UpdateFormAsync(MedicationSubmissionForm form);
        Task DeleteFormAsync(string id);
        Task<bool> FormExistsAsync(string id);
    }
}