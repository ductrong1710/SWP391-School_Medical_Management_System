using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class PeriodicHealthCheckPlanRepository : IPeriodicHealthCheckPlanRepository
    {
        private readonly ApplicationDbContext _context;

        public PeriodicHealthCheckPlanRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetAllPlansAsync()
        {
            return await _context.PeriodicHealthCheckPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .ToListAsync();
        }

        public async Task<PeriodicHealthCheckPlan?> GetPlanByIdAsync(string id)
        {
            return await _context.PeriodicHealthCheckPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .FirstOrDefaultAsync(p => p.ID == id);
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByCreatorIdAsync(string creatorId)
        {
            return await _context.PeriodicHealthCheckPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .Where(p => p.CreatorID == creatorId)
                .ToListAsync();
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetUpcomingPlansAsync()
        {
            return await _context.PeriodicHealthCheckPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .Where(p => p.ScheduleDate > DateTime.Now)
                .OrderBy(p => p.ScheduleDate)
                .ToListAsync();
        }

        public async Task CreatePlanAsync(PeriodicHealthCheckPlan plan)
        {
            await _context.PeriodicHealthCheckPlans.AddAsync(plan);
            await _context.SaveChangesAsync();
        }

        public async Task UpdatePlanAsync(PeriodicHealthCheckPlan plan)
        {
            _context.Entry(plan).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeletePlanAsync(string id)
        {
            var plan = await GetPlanByIdAsync(id);
            if (plan != null)
            {
                _context.PeriodicHealthCheckPlans.Remove(plan);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> PlanExistsAsync(string id)
        {
            return await _context.PeriodicHealthCheckPlans.AnyAsync(p => p.ID == id);
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByStatusAsync(string status)
        {
            return await _context.PeriodicHealthCheckPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .Where(p => p.Status == status)
                .ToListAsync();
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByClassIdAsync(string classId)
        {
            return await _context.PeriodicHealthCheckPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .Where(p => p.ClassID == classId)
                .ToListAsync();
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByCreatedDateRangeAsync(DateTime start, DateTime end)
        {
            return await _context.PeriodicHealthCheckPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .Where(p => p.CreatedDate >= start && p.CreatedDate <= end)
                .ToListAsync();
        }

        public async Task<IEnumerable<object>> GetAllPlansWithClassNameAsync()
        {
            return await _context.PeriodicHealthCheckPlans
                .Include(p => p.Creator)
                .Include(p => p.ConsentForms)
                .Join(_context.SchoolClasses,
                      plan => plan.ClassID,
                      schoolClass => schoolClass.ClassID,
                      (plan, schoolClass) => new {
                          plan.ID,
                          plan.PlanName,
                          plan.ScheduleDate,
                          plan.CheckupContent,
                          plan.Status,
                          plan.ClassID,
                          ClassName = schoolClass.ClassName,
                          plan.CreatedDate,
                          plan.CreatorID,
                          plan.Creator,
                          plan.ConsentForms
                      })
                .ToListAsync();
        }
    }
}