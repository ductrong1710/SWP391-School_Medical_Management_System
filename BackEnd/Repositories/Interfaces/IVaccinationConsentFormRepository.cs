using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IVaccinationConsentFormRepository
    {
        Task<IEnumerable<VaccinationConsentForm>> GetAllVaccinationConsentFormsAsync();
        Task<VaccinationConsentForm?> GetVaccinationConsentFormByIdAsync(string id);
        Task<IEnumerable<VaccinationConsentForm>> GetConsentFormsByPlanIdAsync(string planId);
        Task<IEnumerable<VaccinationConsentForm>> GetConsentFormsByStudentIdAsync(string studentId);
        Task<VaccinationConsentForm?> GetConsentFormByPlanAndStudentAsync(string planId, string studentId);
        Task CreateVaccinationConsentFormAsync(VaccinationConsentForm form);
        Task UpdateVaccinationConsentFormAsync(VaccinationConsentForm form);
        Task DeleteVaccinationConsentFormAsync(string id);
        Task<bool> VaccinationConsentFormExistsAsync(string id);
    }
}