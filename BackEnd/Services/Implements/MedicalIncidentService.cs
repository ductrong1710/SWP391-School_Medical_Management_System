using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Implements
{
    public class MedicalIncidentService : IMedicalIncidentService
    {
        private readonly IMedicalIncidentRepository _incidentRepository;
        private readonly INotificationService _notificationService;
        private readonly IIncidentInvolvementRepository _involvementRepository;
        private readonly ISupplyMedUsageRepository _usageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IHealthRecordRepository _healthRecordRepository;

        public MedicalIncidentService(
            IMedicalIncidentRepository incidentRepository,
            INotificationService notificationService,
            IIncidentInvolvementRepository involvementRepository,
            ISupplyMedUsageRepository usageRepository,
            IUserRepository userRepository,
            IHealthRecordRepository healthRecordRepository)
        {
            _incidentRepository = incidentRepository;
            _notificationService = notificationService;
            _involvementRepository = involvementRepository;
            _usageRepository = usageRepository;
            _userRepository = userRepository;
            _healthRecordRepository = healthRecordRepository;
        }

        public async Task<IEnumerable<MedicalIncident>> GetAllMedicalIncidentsAsync()
            => await _incidentRepository.GetAllAsync();

        public async Task<MedicalIncident?> GetMedicalIncidentByIdAsync(string id)
            => await _incidentRepository.GetByIdAsync(id);

        public async Task<IEnumerable<MedicalIncident>> GetMedicalIncidentsByMedicalStaffIdAsync(string medicalStaffId)
            => await _incidentRepository.GetByMedicalStaffIdAsync(medicalStaffId);

        public async Task<MedicalIncident> CreateMedicalIncidentAsync(MedicalIncident incident, List<IncidentInvolvement> involvements, List<SupplyMedUsage> usages)
        {
            var created = await _incidentRepository.AddAsync(incident, involvements, usages);
            // Gửi notification cho phụ huynh các học sinh liên quan
            var parentIds = new HashSet<string>();
            foreach (var inv in involvements)
            {
                var healthRecord = await _healthRecordRepository.GetHealthRecordByStudentIdAsync(inv.StudentID);
                if (healthRecord != null && !string.IsNullOrEmpty(healthRecord.ParentID))
                    parentIds.Add(healthRecord.ParentID);
            }
            foreach (var parentId in parentIds)
            {
                await _notificationService.CreateNotificationAsync(new Notification
                {
                    NotificationID = System.Guid.NewGuid().ToString(),
                    UserID = parentId,
                    Title = "Thông báo tai nạn y tế",
                    Message = $"Con bạn có liên quan đến một sự cố y tế tại trường. Vui lòng kiểm tra chi tiết trong hệ thống.",
                    CreatedAt = System.DateTime.Now,
                    IsRead = false
                });
            }
            return created;
        }

        public async Task<MedicalIncident> UpdateMedicalIncidentAsync(string id, MedicalIncident incident, List<IncidentInvolvement> involvements, List<SupplyMedUsage> usages)
            => await _incidentRepository.UpdateAsync(id, incident, involvements, usages);

        public async Task<bool> DeleteMedicalIncidentAsync(string id)
            => await _incidentRepository.DeleteAsync(id);

        public async Task<IEnumerable<MedicalIncident>> GetIncidentHistoryByStudentAsync(string studentId)
            => await _incidentRepository.GetIncidentHistoryByStudentAsync(studentId);

        public async Task<IEnumerable<MedicalIncident>> GetIncidentHistoryByParentAsync(string parentId)
            => await _incidentRepository.GetIncidentHistoryByParentAsync(parentId);
    }
} 