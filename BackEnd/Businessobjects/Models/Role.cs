using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class Role
    {
        [Key]
        [Column("RoleID")]
        public string RoleID { get; set; } = null!;
        [Required]
        public string RoleType { get; set; } = null!;
    }
}