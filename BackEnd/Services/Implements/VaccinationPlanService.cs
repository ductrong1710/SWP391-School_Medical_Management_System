using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive
using Businessobjects.Data;
using Microsoft.EntityFrameworkCore;

namespace Services.Implements
{
    public class VaccinationPlanService : IVaccinationPlanService
    {
        private readonly IVaccinationPlanRepository _planRepository;
        private readonly ApplicationDbContext _context;

        public VaccinationPlanService(IVaccinationPlanRepository planRepository, ApplicationDbContext context)
        {
            _planRepository = planRepository;
            _context = context;
        }

        public async Task<IEnumerable<VaccinationPlan>> GetAllVaccinationPlansAsync()
        {
            return await _planRepository.GetAllVaccinationPlansAsync();
        }

        public async Task<VaccinationPlan?> GetVaccinationPlanByIdAsync(string id)
        {
            return await _planRepository.GetVaccinationPlanByIdAsync(id);
        }

        public async Task<IEnumerable<VaccinationPlan>> GetVaccinationPlansByCreatorIdAsync(string creatorId)
        {
            return await _planRepository.GetVaccinationPlansByCreatorIdAsync(creatorId);
        }

        public async Task<IEnumerable<VaccinationPlan>> GetUpcomingVaccinationPlansAsync()
        {
            return await _planRepository.GetUpcomingVaccinationPlansAsync();
        }

        public async Task<string> GenerateNextVaccinationPlanIDAsync()
        {
            var lastPlan = await _context.VaccinationPlans
                .OrderByDescending(p => p.ID)
                .FirstOrDefaultAsync();
            if (lastPlan == null)
                return "VP0001";
            var lastNumber = int.Parse(lastPlan.ID.Substring(2));
            var nextNumber = lastNumber + 1;
            // Đảm bảo ID luôn đúng 6 ký tự: VP + 4 số
            return "VP" + nextNumber.ToString("D4");
        }

        public async Task<VaccinationPlan> CreateVaccinationPlanAsync(VaccinationPlan plan)
        {
            if (plan.ScheduledDate < DateTime.Today)
                throw new InvalidOperationException("Cannot create a vaccination plan with a past date");
            plan.ID = await GenerateNextVaccinationPlanIDAsync();
            await _planRepository.CreateVaccinationPlanAsync(plan);
            return plan;
        }

        public async Task UpdateVaccinationPlanAsync(string id, VaccinationPlan plan)
        {
            if (id != plan.ID)
                throw new ArgumentException("ID mismatch");

            if (!await _planRepository.VaccinationPlanExistsAsync(id))
                throw new KeyNotFoundException("Vaccination plan not found");

            if (plan.ScheduledDate < DateTime.Today)
                throw new InvalidOperationException("Cannot update a vaccination plan with a past date");

            await _planRepository.UpdateVaccinationPlanAsync(plan);
        }

        public async Task DeleteVaccinationPlanAsync(string id)
        {
            if (!await _planRepository.VaccinationPlanExistsAsync(id))
                throw new KeyNotFoundException("Vaccination plan not found");

            var plan = await _planRepository.GetVaccinationPlanByIdAsync(id);
            if (plan?.ConsentForms?.Any() == true)
                throw new InvalidOperationException("Cannot delete a vaccination plan that has associated consent forms");

            await _planRepository.DeleteVaccinationPlanAsync(id);
        }
    }
}