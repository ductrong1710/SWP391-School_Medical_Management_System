using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class MedicationSubmissionForm
    {
        [Key]
        [Column("ID")]
        public string ID { get; set; } = null!;
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
        [Column("Medication_Name")]
        public string? MedicationName { get; set; }
        public string? Dosage { get; set; }
        public string? Instructions { get; set; }
        [Column("Consumption_Time")]
        public string? ConsumptionTime { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; }
        [Column("Parents_Note")]
        public string? ParentsNote { get; set; }
        
        public virtual ICollection<MedicationReceipt>? MedicationReceipts { get; set; }
    }
}