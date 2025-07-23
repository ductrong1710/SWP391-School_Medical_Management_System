using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IVaccinationConsentFormService
    {
        Task<IEnumerable<VaccinationConsentForm>> GetAllVaccinationConsentFormsAsync();
        Task<VaccinationConsentForm?> GetVaccinationConsentFormByIdAsync(string id);
        Task<IEnumerable<VaccinationConsentForm>> GetConsentFormsByPlanIdAsync(string planId);
        Task<IEnumerable<VaccinationConsentForm>> GetConsentFormsByStudentIdAsync(string studentId);
        Task<VaccinationConsentForm?> GetConsentFormByPlanAndStudentAsync(string planId, string studentId);
        Task<VaccinationConsentForm> CreateVaccinationConsentFormAsync(VaccinationConsentForm form);
        Task UpdateVaccinationConsentFormAsync(string id, VaccinationConsentForm form);
        Task DeleteVaccinationConsentFormAsync(string id);
    }
}