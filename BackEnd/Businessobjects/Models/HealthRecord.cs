using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    [Table("Health_Record")]
    public class HealthRecord
    {
        [Key]
        [Column("HealthRecordID")]
        public string HealthRecordID { get; set; } = null!;
        [Required]
        [Column("StudentID")]
        public string StudentID { get; set; } = null!;
        [ForeignKey("StudentID")]
        public User? Student { get; set; }
        [Required]
        [Column("ParentID")]
        public string ParentID { get; set; } = null!;
        [ForeignKey("ParentID")]
        public User? Parent { get; set; }
        public string? Allergies { get; set; }
        [Column("Chronic_Diseases")]
        public string? ChronicDiseases { get; set; }
        [Column("Treatment_History")]
        public string? TreatmentHistory { get; set; }
        public int? Eyesight { get; set; }
        public int? Hearing { get; set; }
        [Column("Vaccination_History")]
        public string? VaccinationHistory { get; set; }
        public string? Note { get; set; }
        public string? ParentContact { get; set; }
    }
}