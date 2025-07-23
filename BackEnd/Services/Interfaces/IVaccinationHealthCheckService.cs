using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IVaccinationHealthCheckService
    {
        Task<IEnumerable<VaccinationHealthCheck>> GetAllVaccinationHealthChecksAsync();
        Task<VaccinationHealthCheck?> GetVaccinationHealthCheckByIdAsync(string id);
        Task<IEnumerable<VaccinationHealthCheck>> GetVaccinationHealthChecksByPlanIdAsync(string planId);
        Task<IEnumerable<VaccinationHealthCheck>> GetVaccinationHealthChecksByStudentIdAsync(string studentId);
        Task<VaccinationHealthCheck> CreateVaccinationHealthCheckAsync(VaccinationHealthCheck vaccinationHealthCheck);
        Task<VaccinationHealthCheck> UpdateVaccinationHealthCheckAsync(VaccinationHealthCheck vaccinationHealthCheck);
        Task<bool> DeleteVaccinationHealthCheckAsync(string id);
    }
} 