using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Businessobjects.Models
{
    [Table("Vaccine_Type")]
    public class VaccineType
    {
        [Key]
        [Column("VaccinationID")]
        public string? VaccinationID { get; set; }
        [Required]
        public string VaccineName { get; set; } = null!;
        public string? Description { get; set; }
        [JsonIgnore]
        public virtual ICollection<VaccinationResult>? VaccinationResults { get; set; }
    }
}