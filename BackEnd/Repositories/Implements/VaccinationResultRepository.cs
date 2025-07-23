using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class VaccinationResultRepository : IVaccinationResultRepository
    {
        private readonly ApplicationDbContext _context;

        public VaccinationResultRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VaccinationResult>> GetAllVaccinationResultsAsync()
        {
            return await _context.VaccinationResults
                .Include(r => r.ConsentForm)
                    .ThenInclude(f => f.Student)
                .Include(r => r.ConsentForm)
                    .ThenInclude(f => f.VaccinationPlan)
                .Include(r => r.VaccineType)
                .ToListAsync();
        }

        public async Task<VaccinationResult?> GetVaccinationResultByIdAsync(string id)
        {
            return await _context.VaccinationResults
                .Include(r => r.ConsentForm)
                    .ThenInclude(f => f.Student)
                .Include(r => r.ConsentForm)
                    .ThenInclude(f => f.VaccinationPlan)
                .Include(r => r.VaccineType)
                .FirstOrDefaultAsync(r => r.ID == id);
        }

        public async Task<VaccinationResult?> GetVaccinationResultByConsentFormIdAsync(string consentFormId)
        {
            return await _context.VaccinationResults
                .Include(r => r.ConsentForm)
                    .ThenInclude(f => f.Student)
                .Include(r => r.ConsentForm)
                    .ThenInclude(f => f.VaccinationPlan)
                .Include(r => r.VaccineType)
                .FirstOrDefaultAsync(r => r.ConsentFormID == consentFormId);
        }

        public async Task<IEnumerable<VaccinationResult>> GetVaccinationResultsByVaccineTypeAsync(string vaccineTypeId)
        {
            return await _context.VaccinationResults
                .Include(r => r.ConsentForm)
                    .ThenInclude(f => f.Student)
                .Include(r => r.ConsentForm)
                    .ThenInclude(f => f.VaccinationPlan)
                .Include(r => r.VaccineType)
                .Where(r => r.VaccineTypeID == vaccineTypeId)
                .ToListAsync();
        }

        public async Task CreateVaccinationResultAsync(VaccinationResult result)
        {
            await _context.VaccinationResults.AddAsync(result);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateVaccinationResultAsync(VaccinationResult result)
        {
            _context.Entry(result).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteVaccinationResultAsync(string id)
        {
            var result = await GetVaccinationResultByIdAsync(id);
            if (result != null)
            {
                _context.VaccinationResults.Remove(result);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> VaccinationResultExistsAsync(string id)
        {
            return await _context.VaccinationResults.AnyAsync(r => r.ID == id);
        }
    }
}