using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Businessobjects.Data;
using Repositories;
using Microsoft.EntityFrameworkCore;
using System.Linq; // Added for .DefaultIfEmpty() and .Max()

namespace Services.Implements
{
    public class PeriodicHealthCheckPlanService : IPeriodicHealthCheckPlanService
    {
        private readonly IPeriodicHealthCheckPlanRepository _planRepository;
        private readonly ISchoolClassService _classService;
        private readonly IHealthCheckConsentFormService _consentFormService;
        private readonly IHealthRecordService _healthRecordService;
        private readonly INotificationService _notificationService;
        private readonly ApplicationDbContext _dbContext;

        public PeriodicHealthCheckPlanService(IPeriodicHealthCheckPlanRepository planRepository, ISchoolClassService classService, IHealthCheckConsentFormService consentFormService, IHealthRecordService healthRecordService, INotificationService notificationService, ApplicationDbContext dbContext)
        {
            _planRepository = planRepository;
            _classService = classService;
            _consentFormService = consentFormService;
            _healthRecordService = healthRecordService;
            _notificationService = notificationService;
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetAllPlansAsync()
        {
            return await _planRepository.GetAllPlansAsync();
        }

        public async Task<PeriodicHealthCheckPlan?> GetPlanByIdAsync(string id)
        {
            return await _planRepository.GetPlanByIdAsync(id);
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByCreatorIdAsync(string creatorId)
        {
            return await _planRepository.GetPlansByCreatorIdAsync(creatorId);
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetUpcomingPlansAsync()
        {
            return await _planRepository.GetUpcomingPlansAsync();
        }

        public async Task<PeriodicHealthCheckPlan> CreatePlanAsync(PeriodicHealthCheckPlan plan)
        {
            // Nếu chưa có ID (tạo mới), backend sẽ tự sinh ID PHxxxx
            if (string.IsNullOrEmpty(plan.ID))
            {
                // Lấy tất cả kế hoạch đã có để tìm số lớn nhất
                var allPlans = await _planRepository.GetAllPlansAsync();
                int maxNumber = allPlans
                    .Select(p => p.ID)
                    .Where(id => id != null && id.StartsWith("PH") && id.Length == 6 && int.TryParse(id.Substring(2), out _))
                    .Select(id => int.Parse(id.Substring(2)))
                    .DefaultIfEmpty(0)
                    .Max();
                var newNumber = maxNumber + 1;
                plan.ID = $"PH{newNumber:D4}";
            }
            await _planRepository.CreatePlanAsync(plan);
            // Sau khi tạo kế hoạch, tạo consent form và gửi notification cho từng phụ huynh
            var students = _dbContext.Profiles.Where(p => p.ClassID == plan.ClassID).ToList();
            foreach (var student in students)
            {
                var healthRecord = _dbContext.HealthRecords.FirstOrDefault(hr => hr.StudentID == student.UserID);
                if (healthRecord == null || string.IsNullOrEmpty(healthRecord.ParentID)) continue;
                var parentId = healthRecord.ParentID;
                var studentName = student.Name ?? "học sinh";
                var message = $"Kế hoạch kiểm tra sức khỏe định kỳ '{plan.PlanName}' đã được tạo. Vui lòng xác nhận cho <b>{studentName}</b>.";
                // Lấy consent form theo planId và studentId
                var consentForm = _dbContext.HealthCheckConsentForms.FirstOrDefault(cf => cf.HealthCheckPlanID == plan.ID && cf.StudentID == student.UserID && cf.ParentID == parentId);
                if (consentForm == null)
                {
                    consentForm = new HealthCheckConsentForm
                    {
                        ID = GenerateConsentFormId(_dbContext),
                        HealthCheckPlanID = plan.ID,
                        StudentID = student.UserID,
                        ParentID = parentId,
                        StatusID = 3, // Waiting
                        ResponseTime = null,
                        ReasonForDenial = null
                    };
                    _dbContext.HealthCheckConsentForms.Add(consentForm);
                    _dbContext.SaveChanges();
                }
                var notification = new Notification
                {
                    NotificationID = Guid.NewGuid().ToString(),
                    UserID = parentId,
                    Title = "Xác nhận kế hoạch kiểm tra sức khỏe định kỳ",
                    Message = message,
                    CreatedAt = DateTime.Now,
                    IsRead = false,
                    ConsentFormID = consentForm.ID
                };
                await _notificationService.CreateNotificationAsync(notification);
            }
            return plan;
        }

        private string GenerateConsentFormId(ApplicationDbContext dbContext)
        {
            var lastId = dbContext.HealthCheckConsentForms
                .Where(cf => cf.ID.StartsWith("HC"))
                .OrderByDescending(cf => cf.ID)
                .Select(cf => cf.ID)
                .FirstOrDefault();
            int number = 1;
            if (!string.IsNullOrEmpty(lastId) && int.TryParse(lastId.Substring(2), out int n))
            {
                number = n + 1;
            }
            return $"HC{number.ToString("D4")}";
        }

        public async Task UpdatePlanAsync(string id, PeriodicHealthCheckPlan plan)
        {
            if (id != plan.ID)
                throw new ArgumentException("ID mismatch");

            if (!await _planRepository.PlanExistsAsync(id))
                throw new KeyNotFoundException("Health check plan not found");

            await _planRepository.UpdatePlanAsync(plan);
        }

        public async Task DeletePlanAsync(string id)
        {
            if (!await _planRepository.PlanExistsAsync(id))
                throw new KeyNotFoundException("Health check plan not found");

            await _planRepository.DeletePlanAsync(id);
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByStatusAsync(string status)
        {
            return await _planRepository.GetPlansByStatusAsync(status);
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByClassIdAsync(string classId)
        {
            return await _planRepository.GetPlansByClassIdAsync(classId);
        }

        public async Task<IEnumerable<PeriodicHealthCheckPlan>> GetPlansByCreatedDateRangeAsync(DateTime start, DateTime end)
        {
            return await _planRepository.GetPlansByCreatedDateRangeAsync(start, end);
        }

        public async Task<IEnumerable<object>> GetAllPlansWithClassNameAsync()
        {
            return await _planRepository.GetAllPlansWithClassNameAsync();
        }
    }
}