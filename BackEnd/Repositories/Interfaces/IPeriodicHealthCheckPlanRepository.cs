using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IPeriodicHealthCheckPlanRepository
    {
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetAllPlansAsync();
        Task<PeriodicHealthCheckPlan?> GetPlanByIdAsync(string id);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByCreatorIdAsync(string creatorId);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetUpcomingPlansAsync();
        Task CreatePlanAsync(PeriodicHealthCheckPlan plan);
        Task UpdatePlanAsync(PeriodicHealthCheckPlan plan);
        Task DeletePlanAsync(string id);
        Task<bool> PlanExistsAsync(string id);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByStatusAsync(string status);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByClassIdAsync(string classId);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByCreatedDateRangeAsync(DateTime start, DateTime end);
        Task<IEnumerable<object>> GetAllPlansWithClassNameAsync();
    }
}