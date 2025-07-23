using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class VaccineTypeRepository : IVaccineTypeRepository
    {
        private readonly ApplicationDbContext _context;

        public VaccineTypeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VaccineType>> GetAllVaccineTypesAsync()
        {
            return await _context.VaccinationTypes
                .Include(v => v.VaccinationResults)
                .ToListAsync();
        }

        public async Task<VaccineType?> GetVaccineTypeByIdAsync(string id)
        {
            return await _context.VaccinationTypes
                .Include(v => v.VaccinationResults)
                .FirstOrDefaultAsync(v => v.VaccinationID == id);
        }

        public async Task CreateVaccineTypeAsync(VaccineType vaccineType)
        {
            await _context.VaccinationTypes.AddAsync(vaccineType);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateVaccineTypeAsync(VaccineType vaccineType)
        {
            _context.Entry(vaccineType).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteVaccineTypeAsync(string id)
        {
            var vaccineType = await GetVaccineTypeByIdAsync(id);
            if (vaccineType != null)
            {
                _context.VaccinationTypes.Remove(vaccineType);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> VaccineTypeExistsAsync(string id)
        {
            return await _context.VaccinationTypes.AnyAsync(v => v.VaccinationID == id);
        }

        public async Task<bool> VaccineTypeExistsByNameAsync(string name)
        {
            return await _context.VaccinationTypes.AnyAsync(v => v.VaccineName.ToLower() == name.ToLower());
        }
    }
}