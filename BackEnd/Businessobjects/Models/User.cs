using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class User
    {
        [Key]
        [Column("UserID")]
        public string UserID { get; set; } = null!;
        [Required]
        public string Username { get; set; } = null!;
        [Required]
        public string Password { get; set; } = null!;
        [Required]
        [Column("RoleID")]
        public string RoleID { get; set; } = null!;
        [ForeignKey("RoleID")]
        public Role? Role { get; set; }
        
        // Navigation properties for new models
        public ICollection<VaccinationHealthCheck> StudentVaccinationHealthChecks { get; set; } = new List<VaccinationHealthCheck>();
        public ICollection<VaccinationHealthCheck> ParentVaccinationHealthChecks { get; set; } = new List<VaccinationHealthCheck>();
        public ICollection<VaccinationConsultation> StudentVaccinationConsultations { get; set; } = new List<VaccinationConsultation>();
        public ICollection<VaccinationConsultation> ParentVaccinationConsultations { get; set; } = new List<VaccinationConsultation>();
        public ICollection<VaccinationConsultation> MedicalStaffVaccinationConsultations { get; set; } = new List<VaccinationConsultation>();
        public ICollection<MedicalIncident> MedicalIncidents { get; set; } = new List<MedicalIncident>();
        public ICollection<IncidentInvolvement> IncidentInvolvements { get; set; } = new List<IncidentInvolvement>();
        public ICollection<MedicationReceipt> ParentMedicationReceipts { get; set; } = new List<MedicationReceipt>();
        public ICollection<MedicationReceipt> MedicalStaffMedicationReceipts { get; set; } = new List<MedicationReceipt>();
    }
}