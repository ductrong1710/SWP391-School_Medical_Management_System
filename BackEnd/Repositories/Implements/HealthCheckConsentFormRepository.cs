using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class HealthCheckConsentFormRepository : IHealthCheckConsentFormRepository
    {
        private readonly ApplicationDbContext _context;

        public HealthCheckConsentFormRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HealthCheckConsentForm>> GetAllConsentFormsAsync()
        {
            return await _context.HealthCheckConsentForms
                .Include(f => f.HealthCheckPlan)
                .Include(f => f.Student)
                .Include(f => f.Status)
                .ToListAsync();
        }

        public async Task<HealthCheckConsentForm?> GetConsentFormByIdAsync(string id)
        {
            return await _context.HealthCheckConsentForms
                .Include(f => f.HealthCheckPlan)
                .Include(f => f.Student)
                .Include(f => f.Status)
                .FirstOrDefaultAsync(f => f.ID == id);
        }

        public async Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByPlanIdAsync(string planId)
        {
            return await _context.HealthCheckConsentForms
                .Include(f => f.HealthCheckPlan)
                .Include(f => f.Student)
                .Include(f => f.Status)
                .Where(f => f.HealthCheckPlanID == planId)
                .ToListAsync();
        }

        public async Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByStudentIdAsync(string studentId)
        {
            return await _context.HealthCheckConsentForms
                .Include(f => f.HealthCheckPlan)
                .Include(f => f.Student)
                .Include(f => f.Status)
                .Where(f => f.StudentID == studentId)
                .ToListAsync();
        }

        public async Task<HealthCheckConsentForm?> GetConsentFormByPlanAndStudentAsync(string planId, string studentId)
        {
            return await _context.HealthCheckConsentForms
                .Include(f => f.HealthCheckPlan)
                .Include(f => f.Student)
                .Include(f => f.Status)
                .FirstOrDefaultAsync(f => f.HealthCheckPlanID == planId && f.StudentID == studentId);
        }

        public async Task CreateConsentFormAsync(HealthCheckConsentForm form)
        {
            // Kiểm tra ParentID có tồn tại trong Users không
            bool parentExists = await _context.Users.AnyAsync(u => u.UserID == form.ParentID);
            if (!parentExists)
            {
                throw new ArgumentException($"ParentID '{form.ParentID}' không tồn tại trong hệ thống.");
            }
            await _context.HealthCheckConsentForms.AddAsync(form);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateConsentFormAsync(HealthCheckConsentForm form)
        {
            _context.Entry(form).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteConsentFormAsync(string id)
        {
            var form = await GetConsentFormByIdAsync(id);
            if (form != null)
            {
                _context.HealthCheckConsentForms.Remove(form);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ConsentFormExistsAsync(string id)
        {
            return await _context.HealthCheckConsentForms.AnyAsync(f => f.ID == id);
        }

        public async Task<IEnumerable<User>> GetChildrenByParentIdAsync(string parentId)
        {
            // Lấy danh sách StudentID từ HealthRecord theo ParentID
            var studentIds = await _context.HealthRecords
                .Where(hr => hr.ParentID == parentId)
                .Select(hr => hr.StudentID)
                .ToListAsync();

            // Lấy thông tin User của các học sinh này
            return await _context.Users
                .Where(u => studentIds.Contains(u.UserID))
                .ToListAsync();
        }

        public async Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByStudentIdsAsync(IEnumerable<string> studentIds)
        {
            return await _context.HealthCheckConsentForms
                .Include(f => f.HealthCheckPlan)
                .Include(f => f.Student)
                .Include(f => f.Status)
                .Where(f => studentIds.Contains(f.StudentID))
                .ToListAsync();
        }
    }
}