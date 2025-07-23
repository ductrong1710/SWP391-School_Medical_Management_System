using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class MedicationRepository : IMedicationRepository
    {
        private readonly ApplicationDbContext _context;

        public MedicationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Medication>> GetAllMedicationsAsync()
        {
            return await _context.Medications.ToListAsync();
        }

        public async Task<Medication?> GetMedicationByIdAsync(string id)
        {
            return await _context.Medications.FirstOrDefaultAsync(m => m.MedicationID == id);
        }

        public async Task<IEnumerable<Medication>> GetExpiredMedicationsAsync()
        {
            return await _context.Medications
                .Where(m => m.ExpiryDate < DateTime.Today)
                .ToListAsync();
        }

        public async Task<IEnumerable<Medication>> GetLowStockMedicationsAsync(int threshold = 10)
        {
            return await _context.Medications
                .Where(m => m.CurrentStock <= threshold)
                .ToListAsync();
        }

        public async Task CreateMedicationAsync(Medication medication)
        {
            await _context.Medications.AddAsync(medication);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateMedicationAsync(Medication medication)
        {
            _context.Entry(medication).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteMedicationAsync(string id)
        {
            var medication = await GetMedicationByIdAsync(id);
            if (medication != null)
            {
                _context.Medications.Remove(medication);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> MedicationExistsAsync(string id)
        {
            return await _context.Medications.AnyAsync(m => m.MedicationID == id);
        }
    }
}