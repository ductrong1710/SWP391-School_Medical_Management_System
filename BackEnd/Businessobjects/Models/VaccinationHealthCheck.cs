using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class VaccinationHealthCheck
    {
        [Key]
        [Column("ID")]
        public string ID { get; set; } = null!;
        [Column("VaccinationPlanID")]
        public string? VaccinationPlanID { get; set; }
        [Column("StudentID")]
        public string? StudentID { get; set; }
        [Column("ParentID")]
        public string? ParentID { get; set; }
        public DateTime? NotificationDate { get; set; }
        public DateTime? ResponseDate { get; set; }
        public string? Status { get; set; } // Pending, Approved, Denied, Completed
        public string? ParentNotes { get; set; }
        public string? MedicalStaffNotes { get; set; }
        public bool? HasAllergies { get; set; }
        public string? AllergyDetails { get; set; }
        public bool? HasChronicConditions { get; set; }
        public string? ChronicConditionDetails { get; set; }
        public bool? HasRecentIllness { get; set; }
        public string? RecentIllnessDetails { get; set; }
        public bool? IsEligibleForVaccination { get; set; }
        public string? IneligibilityReason { get; set; }
        [ForeignKey("VaccinationPlanID")]
        public VaccinationPlan? VaccinationPlan { get; set; }
        [ForeignKey("StudentID")]
        public User? Student { get; set; }
        [ForeignKey("ParentID")]
        public User? Parent { get; set; }
    }
} 