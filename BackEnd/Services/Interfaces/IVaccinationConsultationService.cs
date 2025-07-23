using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IVaccinationConsultationService
    {
        Task<IEnumerable<VaccinationConsultation>> GetAllVaccinationConsultationsAsync();
        Task<VaccinationConsultation?> GetVaccinationConsultationByIdAsync(string id);
        Task<IEnumerable<VaccinationConsultation>> GetVaccinationConsultationsByHealthCheckIdAsync(string healthCheckId);
        Task<IEnumerable<VaccinationConsultation>> GetVaccinationConsultationsByStudentIdAsync(string studentId);
        Task<IEnumerable<VaccinationConsultation>> GetVaccinationConsultationsByMedicalStaffIdAsync(string medicalStaffId);
        Task<VaccinationConsultation> CreateVaccinationConsultationAsync(VaccinationConsultation vaccinationConsultation);
        Task<VaccinationConsultation> UpdateVaccinationConsultationAsync(VaccinationConsultation vaccinationConsultation);
        Task<bool> DeleteVaccinationConsultationAsync(string id);
    }
} 