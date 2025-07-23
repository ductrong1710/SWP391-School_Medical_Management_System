using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services;
using Services.Interfaces;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthCheckConsentFormController : ControllerBase
    {
        private readonly IHealthCheckConsentFormService _consentFormService;
        private readonly IHealthCheckResultService _resultService;

        public HealthCheckConsentFormController(IHealthCheckConsentFormService consentFormService, IHealthCheckResultService resultService)
        {
            _consentFormService = consentFormService;
            _resultService = resultService;
        }

        // GET: api/HealthCheckConsentForm
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HealthCheckConsentForm>>> GetConsentForms()
        {
            var forms = await _consentFormService.GetAllConsentFormsAsync();
            return Ok(forms);
        }

        // GET: api/HealthCheckConsentForm/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HealthCheckConsentForm>> GetConsentForm(string id)
        {
            var consentForm = await _consentFormService.GetConsentFormByIdAsync(id);
            if (consentForm == null)
                return NotFound();

            return Ok(consentForm);
        }

        // GET: api/HealthCheckConsentForm/plan/5
        [HttpGet("plan/{planId}")]
        public async Task<ActionResult<IEnumerable<HealthCheckConsentForm>>> GetConsentFormsByPlan(string planId, [FromQuery] int? statusId)
        {
            var consentForms = await _consentFormService.GetConsentFormsByPlanIdAsync(planId);
            
            if (statusId.HasValue)
            {
                consentForms = consentForms.Where(f => f.StatusID == statusId.Value);
            }
            
            return Ok(consentForms);
        }

        // GET: api/HealthCheckConsentForm/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<HealthCheckConsentForm>>> GetConsentFormsByStudent(string studentId)
        {
            var consentForms = await _consentFormService.GetConsentFormsByStudentIdAsync(studentId);
            return Ok(consentForms);
        }

        // GET: api/HealthCheckConsentForm/plan/5/student/5
        [HttpGet("plan/{planId}/student/{studentId}")]
        public async Task<ActionResult<HealthCheckConsentForm>> GetConsentFormByPlanAndStudent(string planId, string studentId)
        {
            var consentForm = await _consentFormService.GetConsentFormByPlanAndStudentAsync(planId, studentId);
            if (consentForm == null)
                return NotFound();

            return Ok(consentForm);
        }

        // POST: api/HealthCheckConsentForm
        [HttpPost]
        public async Task<ActionResult<HealthCheckConsentForm>> CreateConsentForm(HealthCheckConsentForm form)
        {
            try
            {
                var createdForm = await _consentFormService.CreateConsentFormAsync(form);
                // Đã có logic gửi notification xác nhận cho phụ huynh ở PeriodicHealthCheckPlanController, không gửi thêm ở đây nữa
                // var dbContext = HttpContext.RequestServices.GetService(typeof(Businessobjects.Data.ApplicationDbContext)) as Businessobjects.Data.ApplicationDbContext;
                // var plan = dbContext?.PeriodicHealthCheckPlans.FirstOrDefault(p => p.ID == createdForm.HealthCheckPlanID);
                // var studentProfile = dbContext?.Profiles.FirstOrDefault(p => p.UserID == createdForm.StudentID);
                // var studentName = studentProfile?.Name ?? createdForm.StudentID;
                // var scheduleDate = plan?.ScheduleDate != null ? plan.ScheduleDate.Value.ToString("yyyy-MM-dd") : "";
                // var message = $"Học sinh có mã {createdForm.StudentID} đã được lên lịch khám sức khỏe vào ngày {scheduleDate}. Vui lòng kiểm tra lịch trên hệ thống.";
                // var notification = new Businessobjects.Models.Notification
                // {
                //     NotificationID = Guid.NewGuid().ToString(),
                //     UserID = createdForm.ParentID,
                //     Title = "Thông báo lịch khám sức khỏe",
                //     Message = message,
                //     CreatedAt = DateTime.Now,
                //     IsRead = false,
                //     ConsentFormID = createdForm.ID
                // };
                // dbContext.Notifications.Add(notification);
                // dbContext.SaveChanges();
                return CreatedAtAction(nameof(GetConsentForm), new { id = createdForm.ID }, createdForm);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        // PUT: api/HealthCheckConsentForm/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConsentForm(string id, HealthCheckConsentForm consentForm)
        {
            if (id != consentForm.ID)
                return BadRequest();

            await _consentFormService.UpdateConsentFormAsync(id, consentForm);
            return NoContent();
        }

        // DELETE: api/HealthCheckConsentForm/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConsentForm(string id)
        {
            await _consentFormService.DeleteConsentFormAsync(id);
            return NoContent();
        }

        // Xác nhận đồng ý cho học sinh tham gia kiểm tra định kỳ
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveConsentForm(string id)
        {
            var consentForm = await _consentFormService.GetConsentFormByIdAsync(id);
            if (consentForm == null)
                return NotFound();
            consentForm.StatusID = 1; // Accept
            consentForm.ResponseTime = DateTime.Now;
            await _consentFormService.UpdateConsentFormAsync(id, consentForm);

            // Gửi notification cho admin/medical staff
            var dbContext = HttpContext.RequestServices.GetService(typeof(Businessobjects.Data.ApplicationDbContext)) as Businessobjects.Data.ApplicationDbContext;
            var plan = dbContext?.PeriodicHealthCheckPlans.FirstOrDefault(p => p.ID == consentForm.HealthCheckPlanID);
            var studentProfile = dbContext?.Profiles.FirstOrDefault(p => p.UserID == consentForm.StudentID);
            var studentName = studentProfile?.Name ?? consentForm.StudentID;
            var message = $"Phụ huynh đã xác nhận đồng ý cho <b>{studentName}</b> tham gia kế hoạch '{plan?.PlanName ?? consentForm.HealthCheckPlanID}'.";
            // Gửi cho tất cả admin/medical staff
            var staffUsers = dbContext?.Users.Where(u => u.RoleID == "Admin" || u.RoleID == "MedicalStaff").ToList();
            if (staffUsers != null)
            {
                foreach (var staff in staffUsers)
                {
                    var notification = new Businessobjects.Models.Notification
                    {
                        NotificationID = Guid.NewGuid().ToString(),
                        UserID = staff.UserID,
                        Title = "Phụ huynh xác nhận khám sức khỏe",
                        Message = message,
                        CreatedAt = DateTime.Now,
                        IsRead = false,
                        ConsentFormID = consentForm.ID
                    };
                    dbContext.Notifications.Add(notification);
                }
                dbContext.SaveChanges();
            }
            return Ok(consentForm);
        }

        public class DenyConsentFormRequest
        {
            public string? Reason { get; set; }
        }

        // Từ chối cho học sinh tham gia kiểm tra định kỳ
        [HttpPost("{id}/deny")]
        public async Task<IActionResult> DenyConsentForm(string id, [FromBody] DenyConsentFormRequest request)
        {
            var consentForm = await _consentFormService.GetConsentFormByIdAsync(id);
            if (consentForm == null)
                return NotFound();
            consentForm.StatusID = 2; // Deny
            consentForm.ResponseTime = DateTime.Now;
            consentForm.ReasonForDenial = request?.Reason;
            await _consentFormService.UpdateConsentFormAsync(id, consentForm);

            // Gửi notification cho admin/medical staff
            var dbContext = HttpContext.RequestServices.GetService(typeof(Businessobjects.Data.ApplicationDbContext)) as Businessobjects.Data.ApplicationDbContext;
            var plan = dbContext?.PeriodicHealthCheckPlans.FirstOrDefault(p => p.ID == consentForm.HealthCheckPlanID);
            var studentProfile = dbContext?.Profiles.FirstOrDefault(p => p.UserID == consentForm.StudentID);
            var studentName = studentProfile?.Name ?? consentForm.StudentID;
            var message = $"Phụ huynh đã từ chối cho <b>{studentName}</b> tham gia kế hoạch '{plan?.PlanName ?? consentForm.HealthCheckPlanID}'. Lý do: {request?.Reason}";
            // Gửi cho tất cả admin/medical staff
            var staffUsers = dbContext?.Users.Where(u => u.RoleID == "Admin" || u.RoleID == "MedicalStaff").ToList();
            if (staffUsers != null)
            {
                foreach (var staff in staffUsers)
                {
                    var notification = new Businessobjects.Models.Notification
                    {
                        NotificationID = Guid.NewGuid().ToString(),
                        UserID = staff.UserID,
                        Title = "Phụ huynh từ chối khám sức khỏe",
                        Message = message,
                        CreatedAt = DateTime.Now,
                        IsRead = false,
                        ConsentFormID = consentForm.ID
                    };
                    dbContext.Notifications.Add(notification);
                }
                dbContext.SaveChanges();
            }
            return Ok(consentForm);
        }

        // Lấy lịch sử kiểm tra sức khỏe định kỳ của học sinh, kèm kết quả khám nếu có
        [HttpGet("student/{studentId}/history")]
        public async Task<ActionResult<IEnumerable<object>>> GetHealthCheckHistoryWithResult(string studentId)
        {
            var consentForms = await _consentFormService.GetConsentFormsByStudentIdAsync(studentId);
            var result = new List<object>();
            foreach (var form in consentForms)
            {
                var healthResult = await _resultService.GetHealthCheckResultByConsentIdAsync(form.ID);
                result.Add(new {
                    ConsentForm = form,
                    HealthCheckResult = healthResult
                });
            }
            return Ok(result);
        }
    }
}