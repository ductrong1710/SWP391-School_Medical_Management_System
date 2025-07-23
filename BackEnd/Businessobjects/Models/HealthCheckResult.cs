using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class HealthCheckResult
    {
        [Key]
        [Column("ID")]
        public string ID { get; set; } = null!;
        
        [Column("HealthCheckConsentID")]
        public string? HealthCheckConsentID { get; set; }
        [ForeignKey("HealthCheckConsentID")]
        public HealthCheckConsentForm? HealthCheckConsent { get; set; }
        
        [Column("Height")]
        public int? Height { get; set; }
        
        [Column("Weight")]
        public int? Weight { get; set; }
        
        [Column("BloodPressure")]
        public int? BloodPressure { get; set; }
        
        [Column("HeartRate")]
        public int? HeartRate { get; set; }
        
        [Column("Eyesight")]
        public string? Eyesight { get; set; }
        
        [Column("Hearing")]
        public string? Hearing { get; set; }
        
        [Column("OralHealth")]
        public string? OralHealth { get; set; }
        
        [Column("Spine")]
        public string? Spine { get; set; }
        
        [Column("Conclusion")]
        public string? Conclusion { get; set; }
        
        [Column("CheckUpDate")]
        public DateTime? CheckUpDate { get; set; }
        
        [Column("Checker")]
        public string? Checker { get; set; }
        
        [Column("NeedToContactParent")]
        public bool? NeedToContactParent { get; set; }
        
        [Column("FollowUpDate")]
        public DateTime? FollowUpDate { get; set; }
        
        [Column("Status")]
        public string? Status { get; set; }
        
        [Column("HealthFacility")]
        public string? HealthFacility { get; set; }
        
        [Column("CheckupType")]
        public string? CheckupType { get; set; }
    }
}