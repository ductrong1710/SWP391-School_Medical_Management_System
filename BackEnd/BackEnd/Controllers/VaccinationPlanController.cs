using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services;
using Services.Interfaces;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaccinationPlanController : ControllerBase
    {
        private readonly IVaccinationPlanService _planService;
        private readonly IVaccinationConsentFormService _consentFormService;
        private readonly INotificationService _notificationService;

        public VaccinationPlanController(
            IVaccinationPlanService planService,
            IVaccinationConsentFormService consentFormService,
            INotificationService notificationService)
        {
            _planService = planService;
            _consentFormService = consentFormService;
            _notificationService = notificationService;
        }

        // GET: api/VaccinationPlan
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VaccinationPlan>>> GetVaccinationPlans()
        {
            var plans = await _planService.GetAllVaccinationPlansAsync();
            return Ok(plans);
        }

        // GET: api/VaccinationPlan/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VaccinationPlan>> GetVaccinationPlan(string id)
        {
            var plan = await _planService.GetVaccinationPlanByIdAsync(id);
            if (plan == null)
                return NotFound();

            return Ok(plan);
        }

        // GET: api/VaccinationPlan/creator/5
        [HttpGet("creator/{creatorId}")]
        public async Task<ActionResult<IEnumerable<VaccinationPlan>>> GetVaccinationPlansByCreator(string creatorId)
        {
            var plans = await _planService.GetVaccinationPlansByCreatorIdAsync(creatorId);
            return Ok(plans);
        }

        // GET: api/VaccinationPlan/upcoming
        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<VaccinationPlan>>> GetUpcomingVaccinationPlans()
        {
            var plans = await _planService.GetUpcomingVaccinationPlansAsync();
            return Ok(plans);
        }

        // POST: api/VaccinationPlan
        [HttpPost]
        public async Task<ActionResult<VaccinationPlan>> CreateVaccinationPlan(VaccinationPlan plan)
        {
            try
            {
                var createdPlan = await _planService.CreateVaccinationPlanAsync(plan);

                // Lấy danh sách consent form theo planId
                var consentForms = await _consentFormService.GetConsentFormsByPlanIdAsync(createdPlan.ID);
                var notifiedParents = new HashSet<string>();
                foreach (var form in consentForms)
                {
                    if (!string.IsNullOrEmpty(form.ParentID) && !notifiedParents.Contains(form.ParentID))
                    {
                        var notification = new Notification
                        {
                            NotificationID = Guid.NewGuid().ToString(),
                            UserID = form.ParentID,
                            Title = "Xác nhận kế hoạch tiêm chủng",
                            Message = $"Kế hoạch tiêm chủng '{createdPlan.PlanName}' đã được tạo. Vui lòng xác nhận cho con bạn.",
                            CreatedAt = DateTime.Now,
                            IsRead = false
                        };
                        await _notificationService.CreateNotificationAsync(notification);
                        notifiedParents.Add(form.ParentID);
                    }
                }

                return CreatedAtAction(nameof(GetVaccinationPlan), new { id = createdPlan.ID }, createdPlan);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/VaccinationPlan/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVaccinationPlan(string id, VaccinationPlan plan)
        {
            if (id != plan.ID)
                return BadRequest();

            await _planService.UpdateVaccinationPlanAsync(id, plan);
            return NoContent();
        }

        // DELETE: api/VaccinationPlan/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVaccinationPlan(string id)
        {
            await _planService.DeleteVaccinationPlanAsync(id);
            return NoContent();
        }

        // Gửi thông báo kế hoạch tiêm chủng đến phụ huynh
        [HttpPost("{id}/send-notifications")]
        public async Task<IActionResult> SendNotifications(string id)
        {
            // Lấy kế hoạch tiêm chủng
            var plan = await _planService.GetVaccinationPlanByIdAsync(id);
            if (plan == null)
                return NotFound();

            // Lấy danh sách học sinh theo grade
            var dbContext = HttpContext.RequestServices.GetService(typeof(Businessobjects.Data.ApplicationDbContext)) as Businessobjects.Data.ApplicationDbContext;
            List<Businessobjects.Models.Profile> students;
            if (plan.Grade == null || plan.Grade == "Toàn trường")
            {
                students = dbContext.Profiles.Where(p => p.ClassID != null).ToList();
            }
            else
            {
                int gradeNum = int.Parse(plan.Grade);
                int start = (gradeNum - 6) * 10 + 1;
                int end = start + 9;
                var classIds = Enumerable.Range(start, 10)
                    .Select(i => $"CL{(i).ToString("D4")}")
                    .ToList();
                students = dbContext.Profiles.Where(p => p.ClassID != null && classIds.Contains(p.ClassID)).ToList();
            }

            // Lấy danh sách ParentID từ bảng Health_Record
            var studentUserIds = students.Select(s => s.UserID).ToList();
            var parentIds = dbContext.HealthRecords
                .Where(hr => studentUserIds.Contains(hr.StudentID))
                .Select(hr => hr.ParentID)
                .Distinct()
                .ToList();

            foreach (var student in students)
            {
                var healthRecord = dbContext.HealthRecords.FirstOrDefault(hr => hr.StudentID == student.UserID);
                if (healthRecord == null || string.IsNullOrEmpty(healthRecord.ParentID)) continue;
                var parentId = healthRecord.ParentID;
                var studentName = student.Name ?? "học sinh";
                var message = $"Kế hoạch tiêm chủng '{plan.PlanName}' đã được cập nhật. Vui lòng xác nhận cho học sinh: {studentName.ToUpper()}";
                // Lấy consent form theo planId và studentId
                var consentForm = dbContext.VaccinationConsentForms.FirstOrDefault(cf => cf.VaccinationPlanID == plan.ID && cf.StudentID == student.UserID);
                if (consentForm == null)
                {
                    // Tạo mới consent form nếu chưa có
                    consentForm = new Businessobjects.Models.VaccinationConsentForm
                    {
                        ID = Guid.NewGuid().ToString().Substring(0, 6).ToUpper(),
                        VaccinationPlanID = plan.ID,
                        StudentID = student.UserID,
                        ParentID = parentId,
                        ConsentStatus = null,
                        ResponseTime = null,
                        ReasonForDenial = null
                    };
                    dbContext.VaccinationConsentForms.Add(consentForm);
                    dbContext.SaveChanges();
                }
                var notification = new Notification
                {
                    NotificationID = Guid.NewGuid().ToString(),
                    UserID = parentId,
                    Title = "Xác nhận kế hoạch tiêm chủng",
                    Message = message,
                    CreatedAt = DateTime.Now,
                    IsRead = false,
                    ConsentFormID = consentForm.ID
                };
                await _notificationService.CreateNotificationAsync(notification);

                // Gửi email cho phụ huynh
                var profile = dbContext.Profiles.FirstOrDefault(p => p.UserID == parentId);
                var parentEmail = profile?.Email;
                string className = "(không rõ)";
                if (!string.IsNullOrEmpty(student.ClassID))
                {
                    var schoolClass = dbContext.SchoolClasses.FirstOrDefault(c => c.ClassID == student.ClassID);
                    if (schoolClass != null)
                        className = schoolClass.ClassName;
                }
                string scheduledDate = plan.ScheduledDate.HasValue ? plan.ScheduledDate.Value.ToString("dd/MM/yyyy") : "(vui lòng xem chi tiết trên hệ thống)";
                if (!string.IsNullOrEmpty(parentEmail))
                {
                    var gmailService = new GmailEmailService("credentials/credentials.json", "token.json");
                    string subject = "Thông báo và xác nhận lịch tiêm chủng cho học sinh";
                    string body = $@"
Kính gửi Quý phụ huynh,

Nhà trường xin trân trọng thông báo về lịch tiêm chủng sắp tới dành cho học sinh:

- Họ và tên học sinh: {studentName}
- Lớp: {className}
- Thời gian tiêm chủng: {scheduledDate}
- Địa điểm: Phòng Y tế trường

Để đảm bảo quyền lợi và sức khỏe cho các em học sinh, kính mong Quý phụ huynh vui lòng đăng nhập vào hệ thống quản lý sức khỏe học đường và xác nhận sự đồng ý cho con em mình tham gia tiêm chủng.

**Hướng dẫn xác nhận:**
1. Truy cập trang web của nhà trường: http://localhost:3000/
2. Đăng nhập bằng tài khoản phụ huynh.
3. Vào mục ""Lịch tiêm chủng"" và thực hiện xác nhận cho học sinh.

Nếu Quý phụ huynh có bất kỳ thắc mắc nào về lịch tiêm chủng, loại vắc xin, hoặc cần hỗ trợ thêm thông tin, xin vui lòng liên hệ với nhà trường qua số điện thoại hoặc email trên hệ thống.

Xin chân thành cảm ơn sự hợp tác của Quý phụ huynh!

Trân trọng,
Ban Y tế Trường
";
                    await gmailService.SendEmailAsync(
                        parentEmail,
                        subject,
                        body,
                        isHtml: false
                    );
                }
            }
            return Ok(new { message = "Notifications sent!" });
        }
    }
}