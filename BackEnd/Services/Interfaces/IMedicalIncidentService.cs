using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IMedicalIncidentService
    {
        Task<IEnumerable<MedicalIncident>> GetAllMedicalIncidentsAsync();
        Task<MedicalIncident?> GetMedicalIncidentByIdAsync(string id);
        Task<IEnumerable<MedicalIncident>> GetMedicalIncidentsByMedicalStaffIdAsync(string medicalStaffId);
        Task<MedicalIncident> CreateMedicalIncidentAsync(MedicalIncident incident, List<IncidentInvolvement> involvements, List<SupplyMedUsage> usages);
        Task<MedicalIncident> UpdateMedicalIncidentAsync(string id, MedicalIncident incident, List<IncidentInvolvement> involvements, List<SupplyMedUsage> usages);
        Task<bool> DeleteMedicalIncidentAsync(string id);
        Task<IEnumerable<MedicalIncident>> GetIncidentHistoryByStudentAsync(string studentId);
        Task<IEnumerable<MedicalIncident>> GetIncidentHistoryByParentAsync(string parentId);
    }
} 