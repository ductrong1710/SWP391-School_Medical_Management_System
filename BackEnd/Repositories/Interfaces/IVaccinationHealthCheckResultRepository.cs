using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IVaccinationHealthCheckResultRepository
    {
        Task<IEnumerable<VaccinationHealthCheckResult>> GetAllAsync();
        Task<VaccinationHealthCheckResult?> GetByIdAsync(string id);
        Task<IEnumerable<VaccinationHealthCheckResult>> GetByHealthCheckIdAsync(string healthCheckId);
        Task<VaccinationHealthCheckResult> AddAsync(VaccinationHealthCheckResult vaccinationHealthCheckResult);
        Task<VaccinationHealthCheckResult> UpdateAsync(VaccinationHealthCheckResult vaccinationHealthCheckResult);
        Task<bool> DeleteAsync(string id);
    }
} 