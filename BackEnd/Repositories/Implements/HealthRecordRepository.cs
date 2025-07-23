using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class HealthRecordRepository : IHealthRecordRepository
    {
        private readonly ApplicationDbContext _context;

        public HealthRecordRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HealthRecord>> GetAllHealthRecordsAsync()
        {
            return await _context.HealthRecords
                .Include(h => h.Student)
                .ToListAsync();
        }

        public async Task<HealthRecord?> GetHealthRecordByIdAsync(string id)
        {
            return await _context.HealthRecords
                .Include(h => h.Student)
                .FirstOrDefaultAsync(h => h.HealthRecordID == id);
        }

        public async Task<HealthRecord?> GetHealthRecordByStudentIdAsync(string studentId)
        {
            return await _context.HealthRecords
                .Include(h => h.Student)
                .FirstOrDefaultAsync(h => h.StudentID == studentId);
        }

        public async Task CreateHealthRecordAsync(HealthRecord healthRecord)
        {
            bool parentExists = await _context.Users.AnyAsync(u => u.UserID == healthRecord.ParentID);
            if (!parentExists)
            {
                throw new ArgumentException($"ParentID '{healthRecord.ParentID}' không tồn tại trong hệ thống.");
            }
            bool studentExists = await _context.Users.AnyAsync(u => u.UserID == healthRecord.StudentID);
            if (!studentExists)
            {
                throw new ArgumentException($"StudentID '{healthRecord.StudentID}' không tồn tại trong hệ thống.");
            }
            await _context.HealthRecords.AddAsync(healthRecord);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateHealthRecordAsync(HealthRecord healthRecord)
        {
            _context.Entry(healthRecord).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteHealthRecordAsync(string id)
        {
            var healthRecord = await GetHealthRecordByIdAsync(id);
            if (healthRecord != null)
            {
                _context.HealthRecords.Remove(healthRecord);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> HealthRecordExistsAsync(string id)
        {
            return await _context.HealthRecords.AnyAsync(h => h.HealthRecordID == id);
        }
    }
}