using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repositories.Implements
{
    public class SupplyMedUsageRepository : ISupplyMedUsageRepository
    {
        private readonly ApplicationDbContext _context;
        public SupplyMedUsageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SupplyMedUsage>> GetAllAsync()
            => await _context.SupplyMedUsages.ToListAsync();

        public async Task<SupplyMedUsage?> GetByIdAsync(string id)
            => await _context.SupplyMedUsages.FirstOrDefaultAsync(x => x.UsageID == id);

        public async Task<IEnumerable<SupplyMedUsage>> GetBySupplyIdAsync(string supplyId)
            => await _context.SupplyMedUsages.Where(x => x.SupplyID == supplyId).ToListAsync();

        public async Task<IEnumerable<SupplyMedUsage>> GetByMedicationIdAsync(string medicationId)
            => await _context.SupplyMedUsages.Where(x => x.MedicationID == medicationId).ToListAsync();

        public async Task<SupplyMedUsage> AddAsync(SupplyMedUsage supplyMedUsage)
        {
            await _context.SupplyMedUsages.AddAsync(supplyMedUsage);
            await _context.SaveChangesAsync();
            return supplyMedUsage;
        }

        public async Task<SupplyMedUsage> UpdateAsync(SupplyMedUsage supplyMedUsage)
        {
            _context.Entry(supplyMedUsage).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return supplyMedUsage;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var entity = await _context.SupplyMedUsages.FirstOrDefaultAsync(x => x.UsageID == id);
            if (entity == null) return false;
            _context.SupplyMedUsages.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 