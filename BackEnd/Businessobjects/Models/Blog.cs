using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    [Table("BlogDocument")]
    public class BlogDocument
    {
        [Key]
        [Column("DocumentID")]
        public int DocumentID { get; set; }
        [Required]
        public string Title { get; set; } = null!;
        public string? Category { get; set; }
        public string? Author { get; set; }
        public DateTime? PublishDate { get; set; }
        public string? Summary { get; set; }
        public string Content { get; set; } = null!;
        public string? ImageURL { get; set; }
    }
} 