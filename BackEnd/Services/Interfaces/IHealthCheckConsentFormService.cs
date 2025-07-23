using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IHealthCheckConsentFormService
    {
        Task<IEnumerable<HealthCheckConsentForm>> GetAllConsentFormsAsync();
        Task<HealthCheckConsentForm?> GetConsentFormByIdAsync(string id);
        Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByPlanIdAsync(string planId);
        Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByStudentIdAsync(string studentId);
        Task<HealthCheckConsentForm?> GetConsentFormByPlanAndStudentAsync(string planId, string studentId);
        Task<HealthCheckConsentForm> CreateConsentFormAsync(HealthCheckConsentForm form);
        Task UpdateConsentFormAsync(string id, HealthCheckConsentForm form);
        Task DeleteConsentFormAsync(string id);
        Task<IEnumerable<User>> GetChildrenByParentIdAsync(string parentId);
        Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByStudentIdsAsync(IEnumerable<string> studentIds);
    }
}