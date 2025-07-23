using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IIncidentInvolvementService
    {
        Task<IEnumerable<IncidentInvolvement>> GetAllIncidentInvolvementsAsync();
        Task<IncidentInvolvement?> GetIncidentInvolvementByIdAsync(string id);
        Task<IEnumerable<IncidentInvolvement>> GetIncidentInvolvementsByIncidentIdAsync(string incidentId);
        Task<IEnumerable<IncidentInvolvement>> GetIncidentInvolvementsByStudentIdAsync(string studentId);
        Task<IncidentInvolvement> CreateIncidentInvolvementAsync(IncidentInvolvement incidentInvolvement);
        Task<IncidentInvolvement> UpdateIncidentInvolvementAsync(IncidentInvolvement incidentInvolvement);
        Task<bool> DeleteIncidentInvolvementAsync(string id);
    }
} 