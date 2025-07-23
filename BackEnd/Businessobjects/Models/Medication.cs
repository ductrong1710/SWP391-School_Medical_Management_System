using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class Medication
    {
        [Key]
        [Column("MedicationID")]
        public string MedicationID { get; set; } = null!;
        [Required]
        public string MedicationName { get; set; } = null!;
        public string? Unit { get; set; }
        public int? CurrentStock { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Notes { get; set; }
    }
}