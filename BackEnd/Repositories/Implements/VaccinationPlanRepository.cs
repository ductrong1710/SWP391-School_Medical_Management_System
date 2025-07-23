using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class VaccinationPlanRepository : IVaccinationPlanRepository
    {
        private readonly ApplicationDbContext _context;

        public VaccinationPlanRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VaccinationPlan>> GetAllVaccinationPlansAsync()
        {
            return await _context.VaccinationPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .ThenInclude(cf => cf.Student)
                .ToListAsync();
        }

        public async Task<VaccinationPlan?> GetVaccinationPlanByIdAsync(string id)
        {
            return await _context.VaccinationPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .ThenInclude(cf => cf.Student)
                .FirstOrDefaultAsync(p => p.ID == id);
        }

        public async Task<IEnumerable<VaccinationPlan>> GetVaccinationPlansByCreatorIdAsync(string creatorId)
        {
            return await _context.VaccinationPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .ThenInclude(cf => cf.Student)
                .Where(p => p.CreatorID == creatorId)
                .ToListAsync();
        }

        public async Task<IEnumerable<VaccinationPlan>> GetUpcomingVaccinationPlansAsync()
        {
            return await _context.VaccinationPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .ThenInclude(cf => cf.Student)
                .Where(p => p.ScheduledDate > DateTime.Now)
                .OrderBy(p => p.ScheduledDate)
                .ToListAsync();
        }

        public async Task CreateVaccinationPlanAsync(VaccinationPlan plan)
        {
            await _context.VaccinationPlans.AddAsync(plan);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateVaccinationPlanAsync(VaccinationPlan plan)
        {
            _context.Entry(plan).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteVaccinationPlanAsync(string id)
        {
            var plan = await GetVaccinationPlanByIdAsync(id);
            if (plan != null)
            {
                _context.VaccinationPlans.Remove(plan);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> VaccinationPlanExistsAsync(string id)
        {
            return await _context.VaccinationPlans.AnyAsync(p => p.ID == id);
        }
    }
}