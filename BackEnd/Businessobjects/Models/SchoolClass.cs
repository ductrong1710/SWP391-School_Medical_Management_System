using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    [Table("SchoolClass")]
    public class SchoolClass
    {
        [Key]
        public string ClassID { get; set; }
        public string ClassName { get; set; }
        public string Grade { get; set; }
        // Thêm các trường khác nếu cần
    }
} 