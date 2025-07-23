using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class IncidentInvolvement
    {
        [Key]
        [Column("InvolvementID")]
        public string InvolvementID { get; set; } = null!;
        [Column("IncidentID")]
        public string? IncidentID { get; set; }
        [Column("StudentID")]
        public string? StudentID { get; set; }
        [Column("InjuryDescription")]
        public string? InjuryDescription { get; set; }
        [Column("TreatmentGiven")]
        public string? TreatmentGiven { get; set; }
        [Column("Notes")]
        public string? Notes { get; set; }
        [ForeignKey("IncidentID")]
        public MedicalIncident? MedicalIncident { get; set; }
        [ForeignKey("StudentID")]
        public User? Student { get; set; }
    }
} 