using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    [Table("Profile")]
    public class Profile
    {
        [Key]
        [Column("ProfileID")]
        public string ProfileID { get; set; } = null!;
        [Required]
        public string Name { get; set; } = null!;
        [Column("Date_Of_Birth")]
        public DateTime? DateOfBirth { get; set; }
        public string? Sex { get; set; }
        public string? Email { get; set; }
        [Column("ClassID")]
        public string? ClassID { get; set; }
        public string? Phone { get; set; }
        [Required]
        [Column("UserID")]
        public string UserID { get; set; } = null!;
        [ForeignKey("UserID")]
        public User? User { get; set; }
        public string? Note { get; set; }
    }
}