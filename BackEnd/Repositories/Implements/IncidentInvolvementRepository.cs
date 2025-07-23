using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repositories.Implements
{
    public class IncidentInvolvementRepository : IIncidentInvolvementRepository
    {
        private readonly ApplicationDbContext _context;
        public IncidentInvolvementRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<IncidentInvolvement>> GetAllAsync()
            => await _context.IncidentInvolvements.ToListAsync();

        public async Task<IncidentInvolvement?> GetByIdAsync(string id)
            => await _context.IncidentInvolvements.FirstOrDefaultAsync(x => x.InvolvementID == id);

        public async Task<IEnumerable<IncidentInvolvement>> GetByIncidentIdAsync(string incidentId)
            => await _context.IncidentInvolvements.Where(x => x.IncidentID == incidentId).ToListAsync();

        public async Task<IEnumerable<IncidentInvolvement>> GetByStudentIdAsync(string studentId)
            => await _context.IncidentInvolvements.Where(x => x.StudentID == studentId).ToListAsync();

        public async Task<IncidentInvolvement> AddAsync(IncidentInvolvement incidentInvolvement)
        {
            await _context.IncidentInvolvements.AddAsync(incidentInvolvement);
            await _context.SaveChangesAsync();
            return incidentInvolvement;
        }

        public async Task<IncidentInvolvement> UpdateAsync(IncidentInvolvement incidentInvolvement)
        {
            _context.Entry(incidentInvolvement).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return incidentInvolvement;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var entity = await _context.IncidentInvolvements.FirstOrDefaultAsync(x => x.InvolvementID == id);
            if (entity == null) return false;
            _context.IncidentInvolvements.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 