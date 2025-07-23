using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IVaccinationResultService
    {
        Task<IEnumerable<VaccinationResult>> GetAllVaccinationResultsAsync();
        Task<VaccinationResult?> GetVaccinationResultByIdAsync(string id);
        Task<VaccinationResult?> GetVaccinationResultByConsentFormIdAsync(string consentFormId);
        Task<IEnumerable<VaccinationResult>> GetVaccinationResultsByVaccineTypeAsync(string vaccineTypeId);
        Task<VaccinationResult> CreateVaccinationResultAsync(VaccinationResult result);
        Task UpdateVaccinationResultAsync(string id, VaccinationResult result);
        Task DeleteVaccinationResultAsync(string id);
        Task<IEnumerable<VaccinationResult>> GetVaccinationResultsByStudentAsync(string studentId);
    }
}