using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IVaccinationHealthCheckRepository
    {
        Task<IEnumerable<VaccinationHealthCheck>> GetAllAsync();
        Task<VaccinationHealthCheck?> GetByIdAsync(string id);
        Task<IEnumerable<VaccinationHealthCheck>> GetByPlanIdAsync(string planId);
        Task<IEnumerable<VaccinationHealthCheck>> GetByStudentIdAsync(string studentId);
        Task<VaccinationHealthCheck> AddAsync(VaccinationHealthCheck vaccinationHealthCheck);
        Task<VaccinationHealthCheck> UpdateAsync(VaccinationHealthCheck vaccinationHealthCheck);
        Task<bool> DeleteAsync(string id);
    }
} 