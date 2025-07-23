using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Businessobjects.Models
{
    [Table("Vaccination_Plan")]
    public class VaccinationPlan
    {
        [Key]
        [Column("ID")]
        [StringLength(6, ErrorMessage = "ID must be 6 characters.")]
        public string? ID { get; set; }
        [Required]
        public string PlanName { get; set; } = null!;
        public DateTime? ScheduledDate { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Grade { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        [Required]
        [Column("CreatorID")]
        [StringLength(6, ErrorMessage = "CreatorID must be 6 characters.")]
        public string CreatorID { get; set; } = null!;
        [ForeignKey("CreatorID")]
        public User? Creator { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<VaccinationConsentForm>? ConsentForms { get; set; }
        [JsonIgnore]
        public virtual ICollection<VaccinationHealthCheck>? VaccinationHealthChecks { get; set; }
    }
}