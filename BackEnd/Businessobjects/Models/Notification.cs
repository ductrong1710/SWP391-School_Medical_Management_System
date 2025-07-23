using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    [Table("Notification")]
    public class Notification
    {
        [Key]
        [Column("NotificationID")]
        public string NotificationID { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("UserID")]
        public string UserID { get; set; } = null!;

        [Required]
        public string Title { get; set; } = null!;

        [Required]
        public string Message { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public bool IsRead { get; set; } = false;

        public string? ConsentFormID { get; set; }
    }
} 