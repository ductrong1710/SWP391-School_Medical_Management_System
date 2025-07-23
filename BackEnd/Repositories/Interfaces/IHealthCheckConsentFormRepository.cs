using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IHealthCheckConsentFormRepository
    {
        Task<IEnumerable<HealthCheckConsentForm>> GetAllConsentFormsAsync();
        Task<HealthCheckConsentForm?> GetConsentFormByIdAsync(string id);
        Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByPlanIdAsync(string planId);
        Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByStudentIdAsync(string studentId);
        Task<HealthCheckConsentForm?> GetConsentFormByPlanAndStudentAsync(string planId, string studentId);
        Task CreateConsentFormAsync(HealthCheckConsentForm form);
        Task UpdateConsentFormAsync(HealthCheckConsentForm form);
        Task DeleteConsentFormAsync(string id);
        Task<bool> ConsentFormExistsAsync(string id);
        Task<IEnumerable<User>> GetChildrenByParentIdAsync(string parentId);
        Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByStudentIdsAsync(IEnumerable<string> studentIds);
    }
}