using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IPeriodicHealthCheckPlanService
    {
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetAllPlansAsync();
        Task<PeriodicHealthCheckPlan?> GetPlanByIdAsync(string id);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByCreatorIdAsync(string creatorId);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetUpcomingPlansAsync();
        Task<PeriodicHealthCheckPlan> CreatePlanAsync(PeriodicHealthCheckPlan plan);
        Task UpdatePlanAsync(string id, PeriodicHealthCheckPlan plan);
        Task DeletePlanAsync(string id);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByStatusAsync(string status);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByClassIdAsync(string classId);
        Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByCreatedDateRangeAsync(DateTime start, DateTime end);
        Task<IEnumerable<object>> GetAllPlansWithClassNameAsync();
    }
}