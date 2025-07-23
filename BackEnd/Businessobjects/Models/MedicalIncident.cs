using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class MedicalIncident
    {
        [Key]
        [Column("IncidentID")]
        public string IncidentID { get; set; } = null!;
        [Column("RecordTime")]
        public DateTime? RecordTime { get; set; }
        [Column("IncidentType")]
        public string? IncidentType { get; set; }
        [Column("IncidentDescription")]
        public string? IncidentDescription { get; set; }
        [Column("IncidentMeasures")]
        public string? IncidentMeasures { get; set; }
        [Column("HandlingResults")]
        public string? HandlingResults { get; set; }
        [Column("Note")]
        public string? Note { get; set; }
        [Column("MedicalStaffID")]
        public string? MedicalStaffID { get; set; }
        [ForeignKey("MedicalStaffID")]
        public User? MedicalStaff { get; set; }
    }
} 