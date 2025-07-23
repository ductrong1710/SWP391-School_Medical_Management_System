using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repositories.Implements
{
    public class MedicalIncidentRepository : IMedicalIncidentRepository
    {
        private readonly ApplicationDbContext _context;
        public MedicalIncidentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MedicalIncident>> GetAllAsync()
            => await _context.MedicalIncidents.ToListAsync();

        public async Task<MedicalIncident?> GetByIdAsync(string id)
            => await _context.MedicalIncidents.FirstOrDefaultAsync(x => x.IncidentID == id);

        public async Task<IEnumerable<MedicalIncident>> GetByMedicalStaffIdAsync(string medicalStaffId)
            => await _context.MedicalIncidents.Where(x => x.MedicalStaffID == medicalStaffId).ToListAsync();

        public async Task<MedicalIncident> AddAsync(MedicalIncident incident, List<IncidentInvolvement> involvements, List<SupplyMedUsage> usages)
        {
            await _context.MedicalIncidents.AddAsync(incident);
            await _context.SaveChangesAsync();
            foreach (var inv in involvements)
            {
                inv.IncidentID = incident.IncidentID;
                await _context.IncidentInvolvements.AddAsync(inv);
            }
            foreach (var usage in usages)
            {
                usage.IncidentID = incident.IncidentID;
                await _context.SupplyMedUsages.AddAsync(usage);
            }
            await _context.SaveChangesAsync();
            return incident;
        }

        public async Task<MedicalIncident> UpdateAsync(string id, MedicalIncident incident, List<IncidentInvolvement> involvements, List<SupplyMedUsage> usages)
        {
            var existing = await _context.MedicalIncidents.FirstOrDefaultAsync(x => x.IncidentID == id);
            if (existing == null) throw new KeyNotFoundException();
            _context.Entry(existing).CurrentValues.SetValues(incident);
            var oldInvolvements = _context.IncidentInvolvements.Where(x => x.IncidentID == id);
            _context.IncidentInvolvements.RemoveRange(oldInvolvements);
            foreach (var inv in involvements)
            {
                inv.IncidentID = id;
                await _context.IncidentInvolvements.AddAsync(inv);
            }
            var oldUsages = _context.SupplyMedUsages.Where(x => x.IncidentID == id);
            _context.SupplyMedUsages.RemoveRange(oldUsages);
            foreach (var usage in usages)
            {
                usage.IncidentID = id;
                await _context.SupplyMedUsages.AddAsync(usage);
            }
            await _context.SaveChangesAsync();
            return incident;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var incident = await _context.MedicalIncidents.FirstOrDefaultAsync(x => x.IncidentID == id);
            if (incident == null) return false;
            var involvements = _context.IncidentInvolvements.Where(x => x.IncidentID == id);
            var usages = _context.SupplyMedUsages.Where(x => x.IncidentID == id);
            _context.IncidentInvolvements.RemoveRange(involvements);
            _context.SupplyMedUsages.RemoveRange(usages);
            _context.MedicalIncidents.Remove(incident);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<MedicalIncident>> GetIncidentHistoryByStudentAsync(string studentId)
        {
            var incidentIds = await _context.IncidentInvolvements.Where(x => x.StudentID == studentId).Select(x => x.IncidentID).ToListAsync();
            return await _context.MedicalIncidents.Where(x => incidentIds.Contains(x.IncidentID)).ToListAsync();
        }

        public async Task<IEnumerable<MedicalIncident>> GetIncidentHistoryByParentAsync(string parentId)
        {
            var studentIds = await _context.HealthRecords.Where(x => x.ParentID == parentId).Select(x => x.StudentID).ToListAsync();
            var incidentIds = await _context.IncidentInvolvements.Where(x => studentIds.Contains(x.StudentID)).Select(x => x.IncidentID).ToListAsync();
            return await _context.MedicalIncidents.Where(x => incidentIds.Contains(x.IncidentID)).ToListAsync();
        }
    }
} 