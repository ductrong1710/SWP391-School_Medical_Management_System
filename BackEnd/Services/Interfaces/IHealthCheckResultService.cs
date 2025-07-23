using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IHealthCheckResultService
    {
        Task<IEnumerable<HealthCheckResult>> GetAllHealthCheckResultsAsync();
        Task<HealthCheckResult?> GetHealthCheckResultByIdAsync(string id);
        Task<HealthCheckResult?> GetHealthCheckResultByConsentIdAsync(string consentId);
        Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByCheckerAsync(string checker);
        Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<HealthCheckResult>> GetPendingConsultationsAsync();
        Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByConsentIdsAsync(IEnumerable<string> consentIds);
        Task<HealthCheckResult> CreateHealthCheckResultAsync(HealthCheckResult result);
        Task UpdateHealthCheckResultAsync(string id, HealthCheckResult result);
        Task DeleteHealthCheckResultAsync(string id);
    }
}