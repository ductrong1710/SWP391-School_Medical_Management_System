using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services;
using Services.Interfaces;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PeriodicHealthCheckPlanController : ControllerBase
    {
        private readonly IPeriodicHealthCheckPlanService _planService;
        private readonly IHealthCheckConsentFormService _consentFormService;
        private readonly INotificationService _notificationService;

        public PeriodicHealthCheckPlanController(IPeriodicHealthCheckPlanService planService, IHealthCheckConsentFormService consentFormService, INotificationService notificationService)
        {
            _planService = planService;
            _consentFormService = consentFormService;
            _notificationService = notificationService;
        }

        // GET: api/PeriodicHealthCheckPlan
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPlans()
        {
            var plans = await _planService.GetAllPlansWithClassNameAsync();
            return Ok(plans);
        }

        // GET: api/PeriodicHealthCheckPlan/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PeriodicHealthCheckPlan>> GetPlan(string id)
        {
            var plan = await _planService.GetPlanByIdAsync(id);
            if (plan == null)
                return NotFound();

            return Ok(plan);
        }

        // GET: api/PeriodicHealthCheckPlan/creator/5
        [HttpGet("creator/{creatorId}")]
        public async Task<ActionResult<IEnumerable<PeriodicHealthCheckPlan>>> GetPlansByCreator(string creatorId)
        {
            var plans = await _planService.GetPlansByCreatorIdAsync(creatorId);
            return Ok(plans);
        }

        // GET: api/PeriodicHealthCheckPlan/upcoming
        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<PeriodicHealthCheckPlan>>> GetUpcomingPlans()
        {
            var plans = await _planService.GetUpcomingPlansAsync();
            return Ok(plans);
        }

        // GET: api/PeriodicHealthCheckPlan/status/{status}
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<PeriodicHealthCheckPlan>>> GetPlansByStatus(string status)
        {
            var plans = await _planService.GetPlansByStatusAsync(status);
            return Ok(plans);
        }

        // GET: api/PeriodicHealthCheckPlan/class/{classId}
        [HttpGet("class/{classId}")]
        public async Task<ActionResult<IEnumerable<PeriodicHealthCheckPlan>>> GetPlansByClassId(string classId)
        {
            var plans = await _planService.GetPlansByClassIdAsync(classId);
            return Ok(plans);
        }

        // GET: api/PeriodicHealthCheckPlan/createddate?start=yyyy-MM-dd&end=yyyy-MM-dd
        [HttpGet("createddate")]
        public async Task<ActionResult<IEnumerable<PeriodicHealthCheckPlan>>> GetPlansByCreatedDate([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            var plans = await _planService.GetPlansByCreatedDateRangeAsync(start, end);
            return Ok(plans);
        }

        // POST: api/PeriodicHealthCheckPlan
        [HttpPost]
        public async Task<ActionResult<PeriodicHealthCheckPlan>> CreatePlan(PeriodicHealthCheckPlan plan)
        {
            var createdPlan = await _planService.CreatePlanAsync(plan);
            return CreatedAtAction(nameof(GetPlan), new { id = createdPlan.ID }, createdPlan);
        }

        // PUT: api/PeriodicHealthCheckPlan/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlan(string id, PeriodicHealthCheckPlan plan)
        {
            if (id != plan.ID)
                return BadRequest();

            await _planService.UpdatePlanAsync(id, plan);
            return NoContent();
        }

        // DELETE: api/PeriodicHealthCheckPlan/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlan(string id)
        {
            await _planService.DeletePlanAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/send-notifications")]
        public async Task<IActionResult> SendNotifications(string id)
        {
            var plan = await _planService.GetPlanByIdAsync(id);
            if (plan == null)
                return NotFound();

            var dbContext = HttpContext.RequestServices.GetService(typeof(Businessobjects.Data.ApplicationDbContext)) as Businessobjects.Data.ApplicationDbContext;
            // Lấy danh sách học sinh thuộc lớp này
            var students = dbContext.Profiles.Where(p => p.ClassID == plan.ClassID).ToList();
            var studentUserIds = students.Select(s => s.UserID).ToList();
            var healthRecords = dbContext.HealthRecords.Where(hr => studentUserIds.Contains(hr.StudentID)).ToList();

            foreach (var record in healthRecords)
            {
                if (!string.IsNullOrEmpty(record.ParentID))
                {
                    // Tìm hoặc tạo consent form cho học sinh này với plan hiện tại
                    var consentForm = dbContext.HealthCheckConsentForms
                        .FirstOrDefault(cf => cf.HealthCheckPlanID == plan.ID && cf.StudentID == record.StudentID && cf.ParentID == record.ParentID);

                    if (consentForm == null)
                    {
                        // Tạo mới consent form nếu chưa có
                        consentForm = new HealthCheckConsentForm
                        {
                            ID = GenerateConsentFormId(dbContext),
                            HealthCheckPlanID = plan.ID,
                            StudentID = record.StudentID,
                            ParentID = record.ParentID,
                            StatusID = 3, // 3: Waiting
                            ResponseTime = null,
                            ReasonForDenial = null
                        };
                        dbContext.HealthCheckConsentForms.Add(consentForm);
                        dbContext.SaveChanges();
                    }

                    var notification = new Notification
                    {
                        NotificationID = Guid.NewGuid().ToString(),
                        UserID = record.ParentID,
                        Title = "Thông báo kế hoạch khám sức khỏe",
                        Message = $"Kế hoạch khám sức khỏe '{plan.PlanName}' đã được cập nhật. Vui lòng xác nhận cho con bạn.",
                        CreatedAt = DateTime.Now,
                        IsRead = false,
                        ConsentFormID = consentForm.ID // Gán ID của consent form
                    };
                    await _notificationService.CreateNotificationAsync(notification);
                }
            }
            return Ok(new { message = "Notifications sent!" });
        }

        // Hàm sinh mã tự động cho consent form dạng HC0001, HC0002, ...
        private string GenerateConsentFormId(Businessobjects.Data.ApplicationDbContext dbContext)
        {
            var lastId = dbContext.HealthCheckConsentForms
                .Where(cf => cf.ID.StartsWith("HC"))
                .OrderByDescending(cf => cf.ID)
                .Select(cf => cf.ID)
                .FirstOrDefault();

            int number = 1;
            if (!string.IsNullOrEmpty(lastId) && int.TryParse(lastId.Substring(2), out int n))
            {
                number = n + 1;
            }
            return $"HC{number.ToString("D4")}";
        }
    }
}