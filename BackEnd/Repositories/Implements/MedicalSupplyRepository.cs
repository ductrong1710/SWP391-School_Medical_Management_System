using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class MedicalSupplyRepository : IMedicalSupplyRepository
    {
        private readonly ApplicationDbContext _context;

        public MedicalSupplyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MedicalSupply>> GetAllSuppliesAsync()
        {
            return await _context.MedicalSupplies.ToListAsync();
        }

        public async Task<MedicalSupply?> GetSupplyByIdAsync(string id)
        {
            return await _context.MedicalSupplies.FirstOrDefaultAsync(e => e.SupplyID == id);
        }

        public async Task<MedicalSupply> AddSupplyAsync(MedicalSupply supply)
        {
            _context.MedicalSupplies.Add(supply);
            await _context.SaveChangesAsync();
            return supply;
        }

        public async Task UpdateSupplyAsync(MedicalSupply supply)
        {
            _context.Entry(supply).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteSupplyAsync(string id)
        {
            var supply = await GetSupplyByIdAsync(id);
            if (supply != null)
            {
                _context.MedicalSupplies.Remove(supply);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> SupplyExistsAsync(string id)
        {
            return await _context.MedicalSupplies.AnyAsync(e => e.SupplyID == id);
        }
    }
}