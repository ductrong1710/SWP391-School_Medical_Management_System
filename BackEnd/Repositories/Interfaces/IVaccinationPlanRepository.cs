using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IVaccinationPlanRepository
    {
        Task<IEnumerable<VaccinationPlan>> GetAllVaccinationPlansAsync();
        Task<VaccinationPlan?> GetVaccinationPlanByIdAsync(string id);
        Task<IEnumerable<VaccinationPlan>> GetVaccinationPlansByCreatorIdAsync(string creatorId);
        Task<IEnumerable<VaccinationPlan>> GetUpcomingVaccinationPlansAsync();
        Task CreateVaccinationPlanAsync(VaccinationPlan plan);
        Task UpdateVaccinationPlanAsync(VaccinationPlan plan);
        Task DeleteVaccinationPlanAsync(string id);
        Task<bool> VaccinationPlanExistsAsync(string id);
    }
}