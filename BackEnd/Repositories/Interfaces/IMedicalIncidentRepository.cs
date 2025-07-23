using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IMedicalIncidentRepository
    {
        Task<IEnumerable<MedicalIncident>> GetAllAsync();
        Task<MedicalIncident?> GetByIdAsync(string id);
        Task<IEnumerable<MedicalIncident>> GetByMedicalStaffIdAsync(string medicalStaffId);
        Task<MedicalIncident> AddAsync(MedicalIncident incident, List<IncidentInvolvement> involvements, List<SupplyMedUsage> usages);
        Task<MedicalIncident> UpdateAsync(string id, MedicalIncident incident, List<IncidentInvolvement> involvements, List<SupplyMedUsage> usages);
        Task<bool> DeleteAsync(string id);
        Task<IEnumerable<MedicalIncident>> GetIncidentHistoryByStudentAsync(string studentId);
        Task<IEnumerable<MedicalIncident>> GetIncidentHistoryByParentAsync(string parentId);
    }
} 