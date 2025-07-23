using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class HealthCheckResultRepository : IHealthCheckResultRepository
    {
        private readonly ApplicationDbContext _context;

        public HealthCheckResultRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HealthCheckResult>> GetAllHealthCheckResultsAsync()
        {
            return await _context.HealthCheckResults
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.Student)
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.HealthCheckPlan)
                .ToListAsync();
        }

        public async Task<HealthCheckResult?> GetHealthCheckResultByIdAsync(string id)
        {
            return await _context.HealthCheckResults
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.Student)
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.HealthCheckPlan)
                .FirstOrDefaultAsync(r => r.ID == id);
        }

        public async Task<HealthCheckResult?> GetHealthCheckResultByConsentIdAsync(string consentId)
        {
            return await _context.HealthCheckResults
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.Student)
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.HealthCheckPlan)
                .FirstOrDefaultAsync(r => r.HealthCheckConsentID == consentId);
        }

        public async Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByCheckerAsync(string checker)
        {
            return await _context.HealthCheckResults
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.Student)
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.HealthCheckPlan)
                .Where(r => r.Checker == checker)
                .OrderByDescending(r => r.CheckUpDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.HealthCheckResults
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.Student)
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.HealthCheckPlan)
                .Where(r => r.CheckUpDate >= startDate && r.CheckUpDate <= endDate)
                .OrderByDescending(r => r.CheckUpDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<HealthCheckResult>> GetPendingConsultationsAsync()
        {
            return await _context.HealthCheckResults
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.Student)
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.HealthCheckPlan)
                .Where(r => r.NeedToContactParent == true && r.FollowUpDate >= DateTime.Today)
                .OrderBy(r => r.FollowUpDate)
                .ToListAsync();
        }

        public async Task CreateHealthCheckResultAsync(HealthCheckResult result)
        {
            await _context.HealthCheckResults.AddAsync(result);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateHealthCheckResultAsync(HealthCheckResult result)
        {
            _context.Entry(result).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteHealthCheckResultAsync(string id)
        {
            var result = await GetHealthCheckResultByIdAsync(id);
            if (result != null)
            {
                _context.HealthCheckResults.Remove(result);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> HealthCheckResultExistsAsync(string id)
        {
            return await _context.HealthCheckResults.AnyAsync(r => r.ID == id);
        }

        public async Task<bool> HasResultForConsentAsync(string consentId)
        {
            return await _context.HealthCheckResults.AnyAsync(r => r.HealthCheckConsentID == consentId);
        }

        public async Task<IEnumerable<HealthCheckResult>> GetHealthCheckResultsByConsentIdsAsync(IEnumerable<string> consentIds)
        {
            return await _context.HealthCheckResults
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.Student)
                .Include(r => r.HealthCheckConsent)
                    .ThenInclude(c => c.HealthCheckPlan)
                .Where(r => consentIds.Contains(r.HealthCheckConsentID))
                .ToListAsync();
        }
    }
}