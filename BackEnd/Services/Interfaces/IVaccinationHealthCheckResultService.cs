using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IVaccinationHealthCheckResultService
    {
        Task<IEnumerable<VaccinationHealthCheckResult>> GetAllVaccinationHealthCheckResultsAsync();
        Task<VaccinationHealthCheckResult?> GetVaccinationHealthCheckResultByIdAsync(string id);
        Task<IEnumerable<VaccinationHealthCheckResult>> GetVaccinationHealthCheckResultsByHealthCheckIdAsync(string healthCheckId);
        Task<VaccinationHealthCheckResult> CreateVaccinationHealthCheckResultAsync(VaccinationHealthCheckResult vaccinationHealthCheckResult);
        Task<VaccinationHealthCheckResult> UpdateVaccinationHealthCheckResultAsync(VaccinationHealthCheckResult vaccinationHealthCheckResult);
        Task<bool> DeleteVaccinationHealthCheckResultAsync(string id);
    }
} 