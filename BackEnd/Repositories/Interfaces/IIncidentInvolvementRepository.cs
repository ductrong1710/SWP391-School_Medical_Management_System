using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IIncidentInvolvementRepository
    {
        Task<IEnumerable<IncidentInvolvement>> GetAllAsync();
        Task<IncidentInvolvement?> GetByIdAsync(string id);
        Task<IEnumerable<IncidentInvolvement>> GetByIncidentIdAsync(string incidentId);
        Task<IEnumerable<IncidentInvolvement>> GetByStudentIdAsync(string studentId);
        Task<IncidentInvolvement> AddAsync(IncidentInvolvement incidentInvolvement);
        Task<IncidentInvolvement> UpdateAsync(IncidentInvolvement incidentInvolvement);
        Task<bool> DeleteAsync(string id);
    }
} 