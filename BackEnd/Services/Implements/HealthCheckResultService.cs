using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class HealthCheckResultService : IHealthCheckResultService
    {
        private readonly IHealthCheckResultRepository _resultRepository;
        private readonly IHealthCheckConsentFormRepository _consentFormRepository;

        public HealthCheckResultService(
            IHealthCheckResultRepository resultRepository,
            IHealthCheckConsentFormRepository consentFormRepository)
        {
            _resultRepository = resultRepository;
            _consentFormRepository = consentFormRepository;
        }

        public async Task<IEnumerable<HealthCheckResult>> GetAllHealthCheckResultsAsync()
        {
            return await _resultRepository.GetAllHealthCheckResultsAsync();
        }

        public async Task<HealthCheckResult?> GetHealthCheckResultByIdAsync(string id)
        {
            return await _resultRepository.GetHealthCheckResultByIdAsync(id);
        }

        public async Task<HealthCheckResult?> GetHealthCheckResultByConsentIdAsync(string consentId)
        {
            return await _resultRepository.GetHealthCheckResultByConsentIdAsync(consentId);
        }

        public async Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByCheckerAsync(string checker)
        {
            return await _resultRepository.GetHealthCheckResultsByCheckerAsync(checker);
        }

        public async Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Start date must be before end date");

            return await _resultRepository.GetHealthCheckResultsByDateRangeAsync(startDate, endDate);
        }

        public async Task<IEnumerable<HealthCheckResult>> GetPendingConsultationsAsync()
        {
            return await _resultRepository.GetPendingConsultationsAsync();
        }

        public async Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByConsentIdsAsync(IEnumerable<string> consentIds)
        {
            return await _resultRepository.GetHealthCheckResultsByConsentIdsAsync(consentIds);
        }

        public async Task<HealthCheckResult> CreateHealthCheckResultAsync(HealthCheckResult result)
        {
            Console.WriteLine($"=== CreateHealthCheckResultAsync Start ===");
            Console.WriteLine($"Result ID: {result.ID}");
            Console.WriteLine($"ConsentFormID: {result.HealthCheckConsentID}");
            Console.WriteLine($"CheckUpDate: {result.CheckUpDate}");
            Console.WriteLine($"NeedToContactParent: {result.NeedToContactParent}");
            Console.WriteLine($"FollowUpDate: {result.FollowUpDate}");
            
            var consentForm = await _consentFormRepository.GetConsentFormByIdAsync(result.HealthCheckConsentID);
            Console.WriteLine($"ConsentForm found: {consentForm != null}");
            if (consentForm == null)
            {
                Console.WriteLine("ERROR: Health check consent form not found");
                throw new KeyNotFoundException("Health check consent form not found");
            }
            
            Console.WriteLine($"ConsentForm StatusID: {consentForm.StatusID}");
            if (consentForm.StatusID != 1) // 1: Accept
            {
                Console.WriteLine("ERROR: Cannot create result for non-approved consent form");
                throw new InvalidOperationException("Cannot create result for non-approved consent form");
            }

            var hasExistingResult = await _resultRepository.HasResultForConsentAsync(result.HealthCheckConsentID);
            Console.WriteLine($"Has existing result: {hasExistingResult}");
            if (hasExistingResult)
            {
                Console.WriteLine("ERROR: A result already exists for this consent form");
                throw new InvalidOperationException("A result already exists for this consent form");
            }

            Console.WriteLine($"CheckUpDate > DateTime.Today: {result.CheckUpDate > DateTime.Today}");
            if (result.CheckUpDate > DateTime.Today)
            {
                Console.WriteLine("ERROR: Cannot set future date for check-up date");
                throw new InvalidOperationException("Cannot set future date for check-up date");
            }

            Console.WriteLine($"NeedToContactParent: {result.NeedToContactParent}, FollowUpDate: {result.FollowUpDate}");
            if (result.NeedToContactParent == true && !result.FollowUpDate.HasValue)
            {
                Console.WriteLine("ERROR: Follow-up date is required when parent contact is needed");
                throw new InvalidOperationException("Follow-up date is required when parent contact is needed");
            }

            if (result.FollowUpDate.HasValue && result.FollowUpDate.Value <= DateTime.Today)
            {
                Console.WriteLine("ERROR: Follow-up date must be in the future");
                throw new InvalidOperationException("Follow-up date must be in the future");
            }

            Console.WriteLine("All validations passed, creating result...");
            await _resultRepository.CreateHealthCheckResultAsync(result);
            Console.WriteLine("Result created successfully");
            return result;
        }

        public async Task UpdateHealthCheckResultAsync(string id, HealthCheckResult result)
        {
            if (id != result.ID)
                throw new ArgumentException("ID mismatch");

            if (!await _resultRepository.HealthCheckResultExistsAsync(id))
                throw new KeyNotFoundException("Health check result not found");

            var consentForm = await _consentFormRepository.GetConsentFormByIdAsync(result.HealthCheckConsentID);
            if (consentForm == null)
                throw new KeyNotFoundException("Health check consent form not found");

            if (result.CheckUpDate > DateTime.Today)
                throw new InvalidOperationException("Cannot set future date for check-up date");

            if (result.NeedToContactParent == true && !result.FollowUpDate.HasValue)
                throw new InvalidOperationException("Follow-up date is required when parent contact is needed");

            if (result.FollowUpDate.HasValue && result.FollowUpDate.Value <= DateTime.Today)
                throw new InvalidOperationException("Follow-up date must be in the future");

            await _resultRepository.UpdateHealthCheckResultAsync(result);
        }

        public async Task DeleteHealthCheckResultAsync(string id)
        {
            if (!await _resultRepository.HealthCheckResultExistsAsync(id))
                throw new KeyNotFoundException("Health check result not found");

            await _resultRepository.DeleteHealthCheckResultAsync(id);
        }
    }
}