using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class MedicalSupply
    {
        [Key]
        [Column("SupplyID")]
        public string SupplyID { get; set; } = null!;
        [Required]
        public string SupplyName { get; set; } = null!;
        public string? Unit { get; set; }
        public int? CurrentStock { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Notes { get; set; }
    }
}