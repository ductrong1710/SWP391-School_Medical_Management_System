using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Businessobjects.Models
{
    public class Status
    {
        [Key]
        [Column("StatusID")]
        public int StatusID { get; set; }
        
        [Column("StatusName")]
        public string StatusName { get; set; } = null!;
        
        public virtual ICollection<HealthCheckConsentForm>? HealthCheckConsentForms { get; set; }
    }
} 