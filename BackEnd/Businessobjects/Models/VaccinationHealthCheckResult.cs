using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class VaccinationHealthCheckResult
    {
        [Key]
        [Column("ID")]
        public string ID { get; set; } = null!;
        [Column("VaccinationHealthCheckID")]
        public string? VaccinationHealthCheckID { get; set; }
        public int? Height { get; set; }
        public int? Weight { get; set; }
        public int? BloodPressure { get; set; }
        public int? HeartRate { get; set; }
        public string? Eyesight { get; set; }
        public string? Hearing { get; set; }
        public string? OralHealth { get; set; }
        public string? Spine { get; set; }
        public string? Conclusion { get; set; }
        public DateTime? CheckUpDate { get; set; }
        public string? Checker { get; set; }
        public bool? ConsultationRecommended { get; set; }
        public DateTime? ConsultationAppointmentDate { get; set; }
        [ForeignKey("VaccinationHealthCheckID")]
        public VaccinationHealthCheck? VaccinationHealthCheck { get; set; }
    }
} 