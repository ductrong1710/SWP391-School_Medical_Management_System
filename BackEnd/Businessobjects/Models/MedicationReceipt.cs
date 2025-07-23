using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class MedicationReceipt
    {
        [Key]
        [Column("ID")]
        public string ID { get; set; } = null!;
        [Column("MedicationSubmissionFormID")]
        public string? MedicationSubmissionFormID { get; set; }
        [Column("ParentID")]
        public string? ParentID { get; set; }
        [Column("MedicalStaffID")]
        public string? MedicalStaffID { get; set; }
        public DateTime? ReceiptDate { get; set; }
        public string? MedicationName { get; set; }
        public string? Dosage { get; set; }
        public string? Frequency { get; set; }
        public string? Instructions { get; set; }
        public string? StorageInstructions { get; set; }
        public string? SideEffects { get; set; }
        public string? Status { get; set; } // Received, Administered, Returned
        public string? Notes { get; set; }
        [ForeignKey("MedicationSubmissionFormID")]
        public MedicationSubmissionForm? MedicationSubmissionForm { get; set; }
        [ForeignKey("ParentID")]
        public User? Parent { get; set; }
        [ForeignKey("MedicalStaffID")]
        public User? MedicalStaff { get; set; }
    }
} 