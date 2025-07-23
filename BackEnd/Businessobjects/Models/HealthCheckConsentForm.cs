using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class HealthCheckConsentForm
    {
        [Key]
        [Column("ID")]
        public string ID { get; set; } = null!;
        
        [Column("HealthCheckPlanID")]
        public string? HealthCheckPlanID { get; set; }
        [ForeignKey("HealthCheckPlanID")]
        public PeriodicHealthCheckPlan? HealthCheckPlan { get; set; }
        
        [Column("StudentID")]
        public string? StudentID { get; set; }
        [ForeignKey("StudentID")]
        public User? Student { get; set; }
        
        [Column("ParentID")]
        public string? ParentID { get; set; }
        [ForeignKey("ParentID")]
        public User? Parent { get; set; }
        
        [Column("StatusID")]
        public int? StatusID { get; set; }
        [ForeignKey("StatusID")]
        public Status? Status { get; set; }
        
        [Column("ResponseTime")]
        public DateTime? ResponseTime { get; set; }
        
        [Column("ReasonForDenial")]
        public string? ReasonForDenial { get; set; }
    }
}