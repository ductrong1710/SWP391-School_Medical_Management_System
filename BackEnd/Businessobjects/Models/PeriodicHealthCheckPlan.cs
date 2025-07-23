using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class PeriodicHealthCheckPlan
    {
        [Key]
        [Column("ID")]
        public string? ID { get; set; }
        
        [Required]
        [Column("PlanName")]
        public string PlanName { get; set; } = null!;
        
        [Column("ScheduleDate")]
        public DateTime? ScheduleDate { get; set; }
        
        [Column("CheckupContent")]
        public string? CheckupContent { get; set; }
        
        [Column("Status")]
        public string? Status { get; set; }
        
        [Column("CreatorID")]
        public string CreatorID { get; set; } = null!;
        [ForeignKey("CreatorID")]
        public User? Creator { get; set; }
        
        [Column("ClassID")]
        public string? ClassID { get; set; }
        [ForeignKey("ClassID")]
        public SchoolClass? Class { get; set; }
        
        [Column("CreatedDate")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        
        public virtual ICollection<HealthCheckConsentForm>? ConsentForms { get; set; }
    }
}