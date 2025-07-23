using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IHealthCheckResultRepository
    {
        Task<IEnumerable<HealthCheckResult>> GetAllHealthCheckResultsAsync();
        Task<HealthCheckResult?> GetHealthCheckResultByIdAsync(string id);
        Task<HealthCheckResult?> GetHealthCheckResultByConsentIdAsync(string consentId);
        Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByCheckerAsync(string checker);
        Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<HealthCheckResult>> GetPendingConsultationsAsync();
        Task CreateHealthCheckResultAsync(HealthCheckResult result);
        Task UpdateHealthCheckResultAsync(HealthCheckResult result);
        Task DeleteHealthCheckResultAsync(string id);
        Task<bool> HealthCheckResultExistsAsync(string id);
        Task<bool> HasResultForConsentAsync(string consentId);
        Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByConsentIdsAsync(IEnumerable<string> consentIds);
    }
}