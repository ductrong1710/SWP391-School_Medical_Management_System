using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class SupplyMedUsage
    {
        [Key]
        [Column("UsageID")]
        public string UsageID { get; set; } = null!;
        [Column("IncidentID")]
        public string? IncidentID { get; set; }
        [Column("SupplyID")]
        public string? SupplyID { get; set; }
        [Column("MedicationID")]
        public string? MedicationID { get; set; }
        [Column("QuantityUsed")]
        public int? QuantityUsed { get; set; }
        [Column("UsageTime")]
        public DateTime? UsageTime { get; set; }
        public string? UsagePurpose { get; set; }
        public string? AdministeredBy { get; set; }
        public string? Notes { get; set; }
        [ForeignKey("IncidentID")]
        public MedicalIncident? MedicalIncident { get; set; }
        [ForeignKey("SupplyID")]
        public MedicalSupply? MedicalSupply { get; set; }
        [ForeignKey("MedicationID")]
        public Medication? Medication { get; set; }
    }
} 