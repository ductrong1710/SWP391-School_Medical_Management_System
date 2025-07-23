using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class VaccinationConsultation
    {
        [Key]
        [Column("ID")]
        public string ID { get; set; } = null!;
        [Column("VaccinationHealthCheckID")]
        public string? VaccinationHealthCheckID { get; set; }
        [Column("StudentID")]
        public string? StudentID { get; set; }
        [Column("ParentID")]
        public string? ParentID { get; set; }
        [Column("MedicalStaffID")]
        public string? MedicalStaffID { get; set; }
        public DateTime? ConsultationDate { get; set; }
        public string? ConsultationType { get; set; } // Pre-vaccination, Post-vaccination, Follow-up
        public string? ConsultationNotes { get; set; }
        public string? Recommendations { get; set; }
        public string? Status { get; set; } // Scheduled, Completed, Cancelled
        public DateTime? ScheduledDate { get; set; }
        public string? Location { get; set; }
        public string? Duration { get; set; }
        [ForeignKey("VaccinationHealthCheckID")]
        public VaccinationHealthCheck? VaccinationHealthCheck { get; set; }
        [ForeignKey("StudentID")]
        public User? Student { get; set; }
        [ForeignKey("ParentID")]
        public User? Parent { get; set; }
        [ForeignKey("MedicalStaffID")]
        public User? MedicalStaff { get; set; }
    }
} 