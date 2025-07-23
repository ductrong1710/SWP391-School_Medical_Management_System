using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Businessobjects.Models
{
    [Table("Vaccination_Result")]
    public class VaccinationResult
    {
        [Key]
        [Column("ID")]
        public string? ID { get; set; }
        [Required]
        [Column("ConsentFormID")]
        public string ConsentFormID { get; set; } = null!;
        [ForeignKey("ConsentFormID")]
        public VaccinationConsentForm? ConsentForm { get; set; }
        [Required]
        [Column("VaccineTypeID")]
        public string VaccineTypeID { get; set; } = null!;
        [JsonIgnore]
        [ForeignKey("VaccineTypeID")]
        public virtual VaccineType? VaccineType { get; set; }
        public DateTime? ActualVaccinationDate { get; set; }
        public string? Performer { get; set; }
        public string? PostVaccinationReaction { get; set; }
        public string? Notes { get; set; }
    }
}