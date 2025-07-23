using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IVaccinationConsultationRepository
    {
        Task<IEnumerable<VaccinationConsultation>> GetAllAsync();
        Task<VaccinationConsultation?> GetByIdAsync(string id);
        Task<IEnumerable<VaccinationConsultation>> GetByHealthCheckIdAsync(string healthCheckId);
        Task<IEnumerable<VaccinationConsultation>> GetByStudentIdAsync(string studentId);
        Task<IEnumerable<VaccinationConsultation>> GetByMedicalStaffIdAsync(string medicalStaffId);
        Task<VaccinationConsultation> AddAsync(VaccinationConsultation vaccinationConsultation);
        Task<VaccinationConsultation> UpdateAsync(VaccinationConsultation vaccinationConsultation);
        Task<bool> DeleteAsync(string id);
    }
} 