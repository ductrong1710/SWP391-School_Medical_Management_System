using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services;
using Services.Interfaces;
using Microsoft.Extensions.Logging;
using System.Linq; // Thêm để sử dụng method Any()
using System.IO;
using System;
using System.Collections.Generic;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthCheckResultController : ControllerBase
    {
        private readonly IHealthCheckResultService _resultService;
        private readonly IHealthCheckConsentFormService _consentFormService;
        private readonly IHealthRecordService _healthRecordService;
        private readonly ILogger<HealthCheckResultController> _logger;
        private readonly IPeriodicHealthCheckPlanService _planService;

        public HealthCheckResultController(
            IHealthCheckResultService resultService,
            IHealthCheckConsentFormService consentFormService,
            IHealthRecordService healthRecordService,
            ILogger<HealthCheckResultController> logger,
            IPeriodicHealthCheckPlanService planService
        )
        {
            _resultService = resultService;
            _consentFormService = consentFormService;
            _healthRecordService = healthRecordService;
            _logger = logger;
            _planService = planService;
        }

        // GET: api/HealthCheckResult
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HealthCheckResult>>> GetHealthCheckResults()
        {
            try
            {
                var results = await _resultService.GetAllHealthCheckResultsAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHealthCheckResults: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/HealthCheckResult/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HealthCheckResult>> GetHealthCheckResult(string id)
        {
            try
            {
                var result = await _resultService.GetHealthCheckResultByIdAsync(id);
                if (result == null)
                    return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHealthCheckResult for id {id}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/HealthCheckResult/consent/5
        [HttpGet("consent/{consentId}")]
        public async Task<ActionResult<HealthCheckResult>> GetHealthCheckResultByConsent(string consentId)
        {
            try
            {
                var result = await _resultService.GetHealthCheckResultByConsentIdAsync(consentId);
                if (result == null)
                    return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHealthCheckResultByConsent for consentId {consentId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/HealthCheckResult/checker/DrSmith
        [HttpGet("checker/{checker}")]
        public async Task<ActionResult<IEnumerable<HealthCheckResult>>> GetHealthCheckResultsByChecker(string checker)
        {
            try
            {
                var results = await _resultService.GetHealthCheckResultsByCheckerAsync(checker);
                return Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHealthCheckResultsByChecker for checker {checker}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/HealthCheckResult/daterange
        [HttpGet("daterange")]
        public async Task<ActionResult<IEnumerable<HealthCheckResult>>> GetHealthCheckResultsByDateRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            try
            {
                var results = await _resultService.GetHealthCheckResultsByDateRangeAsync(startDate, endDate);
                return Ok(results);
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"Bad request in GetHealthCheckResultsByDateRange: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHealthCheckResultsByDateRange: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/HealthCheckResult/pending-consultations
        [HttpGet("pending-consultations")]
        public async Task<ActionResult<IEnumerable<HealthCheckResult>>> GetPendingConsultations()
        {
            try
            {
                var results = await _resultService.GetPendingConsultationsAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetPendingConsultations: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/HealthCheckResult
        [HttpPost]
        public async Task<ActionResult<HealthCheckResult>> CreateHealthCheckResult(HealthCheckResult result)
        {
            try
            {
                _logger.LogInformation($"Creating health check result with ID: {result.ID}");
                _logger.LogInformation($"ConsentFormID: {result.HealthCheckConsentID}");
                _logger.LogInformation($"CheckUpDate: {result.CheckUpDate}");
                _logger.LogInformation($"NeedToContactParent: {result.NeedToContactParent}");
                _logger.LogInformation($"FollowUpDate: {result.FollowUpDate}");
                
                var createdResult = await _resultService.CreateHealthCheckResultAsync(result);
                _logger.LogInformation($"Successfully created health check result with ID: {createdResult.ID}");
                return CreatedAtAction(nameof(GetHealthCheckResult), new { id = createdResult.ID }, createdResult);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogError($"Not found in CreateHealthCheckResult: {ex.Message}");
                Console.WriteLine($"Not found in CreateHealthCheckResult: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError($"Bad request in CreateHealthCheckResult: {ex.Message}");
                Console.WriteLine($"Bad request in CreateHealthCheckResult: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in CreateHealthCheckResult: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                Console.WriteLine($"Error in CreateHealthCheckResult: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/HealthCheckResult/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHealthCheckResult(string id, HealthCheckResult result)
        {
            try
            {
                if (id != result.ID)
                    return BadRequest();
                await _resultService.UpdateHealthCheckResultAsync(id, result);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                Console.WriteLine($"Not found in UpdateHealthCheckResult for id {id}: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Bad request in UpdateHealthCheckResult for id {id}: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateHealthCheckResult for id {id}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/HealthCheckResult/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHealthCheckResult(string id)
        {
            try
            {
                await _resultService.DeleteHealthCheckResultAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                Console.WriteLine($"Not found in DeleteHealthCheckResult for id {id}: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteHealthCheckResult for id {id}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/HealthCheckResult/batch
        [HttpPost("batch")]
        public async Task<IActionResult> BatchCreate([FromBody] BatchHealthCheckCreateModel model)
        {
            Console.WriteLine("=== BATCH CREATE REQUEST START ===");
            Console.WriteLine($"Request received at: {DateTime.Now}");
            Console.WriteLine($"Request body length: {Request.ContentLength}");
            
            Console.WriteLine($"Model binding result: {model?.ToString() ?? "null"}");
            Console.WriteLine($"ModelState.IsValid: {ModelState.IsValid}");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine("ModelState validation failed:");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"Field: {error.Key}, Errors: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState);
            }
            
            Console.WriteLine($"BatchCreate input: {model?.ToString() ?? "null"}");
            
            // Validation
            if (model == null)
            {
                Console.WriteLine("BatchCreate: Model is null");
                return BadRequest(new { error = "Dữ liệu không hợp lệ." });
            }
            
            Console.WriteLine($"BatchCreate: Model is not null, checking PlanName. PlanName: '{model.PlanName}'");
            if (string.IsNullOrEmpty(model.PlanName))
            {
                Console.WriteLine("BatchCreate: PlanName is null or empty");
                return BadRequest(new { error = "Tên kế hoạch không được để trống." });
            }
            
            Console.WriteLine($"BatchCreate: PlanName is valid, checking ClassID. ClassID: '{model.ClassID}'");
            if (string.IsNullOrEmpty(model.ClassID))
            {
                Console.WriteLine("BatchCreate: ClassID is null or empty");
                return BadRequest(new { error = "Mã lớp không được để trống." });
            }
            
            Console.WriteLine($"BatchCreate: ClassID is valid, checking CreatorID. CreatorID: '{model.CreatorID}'");
            if (string.IsNullOrEmpty(model.CreatorID))
            {
                Console.WriteLine("BatchCreate: CreatorID is null or empty");
                return BadRequest(new { error = "Người tạo không được để trống." });
            }
            
            Console.WriteLine($"BatchCreate: CreatorID is valid, checking StudentIds. StudentIds count: {model.StudentIds?.Count ?? 0}");
            if (model.StudentIds == null || !model.StudentIds.Any())
            {
                Console.WriteLine("BatchCreate: StudentIds is null or empty");
                return BadRequest(new { error = "Danh sách học sinh không được để trống." });
            }
            
            // Additional validation for individual student IDs
            foreach (var studentId in model.StudentIds)
            {
                Console.WriteLine($"BatchCreate: Checking student ID: '{studentId?.ToString() ?? "null"}'");
                if (string.IsNullOrEmpty(studentId))
                {
                    Console.WriteLine("BatchCreate: Found empty student ID in list");
                    return BadRequest(new { error = "Danh sách học sinh chứa ID không hợp lệ." });
                }
            }
            
            Console.WriteLine("BatchCreate: All validations passed, creating plan");
            try
            {
                // Sinh ID tăng dần: PH + 4 số, ví dụ PH0001, PH0002
                var allPlans = await _planService.GetAllPlansAsync();
                var maxNumber = allPlans
                    .Select(p => p.ID)
                    .Where(id => id.StartsWith("PH") && id.Length == 6 && int.TryParse(id.Substring(2), out _))
                    .Select(id => int.Parse(id.Substring(2)))
                    .DefaultIfEmpty(0)
                    .Max();
                var newNumber = maxNumber + 1;
                var planId = $"PH{newNumber:D4}";
                var plan = new PeriodicHealthCheckPlan
                {
                    ID = planId,
                    PlanName = model.PlanName ?? $"Kế hoạch khám lớp {model.ClassID}",
                    ScheduleDate = DateTime.TryParse(model.CheckupDate, out var d) ? d : DateTime.Now,
                    CheckupContent = model.CheckupContent ?? model.Notes,
                    Status = "Đã lên lịch",
                    ClassID = model.ClassID,
                    CreatedDate = DateTime.Now,
                    CreatorID = model.CreatorID
                };
                
                Console.WriteLine($"BatchCreate: Creating plan with ID: {planId}");
                await _planService.CreatePlanAsync(plan);

                var createdConsentForms = new List<HealthCheckConsentForm>();
                foreach (var studentId in model.StudentIds)
                {
                    Console.WriteLine($"BatchCreate: Processing student: {studentId}");
                    var healthRecord = await _healthRecordService.GetHealthRecordByStudentIdAsync(studentId);
                    var parentId = healthRecord?.ParentID ?? "U00005";

                    string consentId = "HC" + Guid.NewGuid().ToString("N").Substring(0, 4).ToUpper();

                    var consentForm = await _consentFormService.GetConsentFormByPlanAndStudentAsync(planId, studentId);
                    if (consentForm == null)
                    {
                        var newConsentForm = new HealthCheckConsentForm
                        {
                            ID = consentId,
                            HealthCheckPlanID = planId,
                            StudentID = studentId,
                            ParentID = parentId,
                            StatusID = 3, // 3: Waiting
                            ResponseTime = null,
                            ReasonForDenial = null
                        };
                        consentForm = await _consentFormService.CreateConsentFormAsync(newConsentForm);
                        Console.WriteLine($"BatchCreate: Created consent form {consentId} for student {studentId}");
                    }
                    createdConsentForms.Add(consentForm);
                }

                Console.WriteLine($"BatchCreate: Successfully created plan {planId} with {createdConsentForms.Count} consent forms");

                // Đã chuyển logic gửi notification vào service, không gửi ở đây nữa

                return Ok(new { message = "Batch created", planId, results = createdConsentForms });
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Invalid operation in BatchCreate: {ex.Message}");
                return BadRequest(new { error = "Đã tồn tại phiếu đồng ý cho học sinh này trong kế hoạch này." });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                Console.WriteLine($"Database update error in BatchCreate: {ex.Message}");
                return StatusCode(500, new { error = "Lỗi khi lưu dữ liệu vào cơ sở dữ liệu." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in BatchCreate: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/HealthCheckResult/batch-test
        [HttpPost("batch-test")]
        public IActionResult BatchTest([FromBody] object data)
        {
            Console.WriteLine("=== BATCH TEST REQUEST START ===");
            Console.WriteLine($"Request received at: {DateTime.Now}");
            Console.WriteLine($"Raw data received: {data?.ToString() ?? "null"}");
            Console.WriteLine($"ModelState.IsValid: {ModelState.IsValid}");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine("ModelState validation failed:");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"Field: {error.Key}, Errors: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState);
            }
            
            return Ok(new { message = "Test endpoint reached successfully", data });
        }

        // POST: api/HealthCheckResult/batch-simple
        [HttpPost("batch-simple")]
        public IActionResult BatchSimple([FromBody] dynamic data)
        {
            Console.WriteLine("=== BATCH SIMPLE REQUEST START ===");
            Console.WriteLine($"Request received at: {DateTime.Now}");
            Console.WriteLine($"Dynamic data received: {data?.ToString() ?? "null"}");
            
            try
            {
                // Try to access properties
                string? planName = data?.PlanName?.ToString();
                string? classId = data?.ClassID?.ToString();
                string? creatorId = data?.CreatorID?.ToString();
                var studentIds = data?.StudentIds;
                
                Console.WriteLine($"Extracted data - PlanName: {planName ?? "null"}, ClassID: {classId ?? "null"}, CreatorID: {creatorId ?? "null"}");
                
                return Ok(new { message = "Simple endpoint reached successfully", extractedData = new { planName, classId, creatorId, studentIds } });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing dynamic data: {ex.Message}");
                return BadRequest(new { error = "Error processing data", details = ex.Message });
            }
        }

        // GET: api/HealthCheckResult/student/{studentId}/history
        [HttpGet("student/{studentId}/history")]
        public async Task<IActionResult> GetHistoryByStudent(string studentId)
        {
            try
            {
                // Lấy tất cả consent form của học sinh
                var consentForms = await _consentFormService.GetConsentFormsByStudentIdAsync(studentId);
                if (consentForms == null || !consentForms.Any())
                    return Ok(new List<HealthCheckResult>());
                var consentIds = consentForms.Select(f => f.ID).ToList();
                // Lấy tất cả kết quả khám liên quan
                var results = await _resultService.GetHealthCheckResultsByConsentIdsAsync(consentIds);
                return Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHistoryByStudent for studentId {studentId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/HealthCheckResult/parent/{parentId}/history
        [HttpGet("parent/{parentId}/history")]
        public async Task<IActionResult> GetHistoryByParent(string parentId)
        {
            try
            {
                // Lấy tất cả học sinh của phụ huynh
                var children = await _consentFormService.GetChildrenByParentIdAsync(parentId);
                if (children == null || !children.Any())
                    return Ok(new List<HealthCheckResult>());
                var studentIds = children.Select(c => c.UserID).ToList();

                // Lấy tất cả consent form của các học sinh
                var consentForms = await _consentFormService.GetConsentFormsByStudentIdsAsync(studentIds);
                if (consentForms == null || !consentForms.Any())
                    return Ok(new List<HealthCheckResult>());
                var consentIds = consentForms.Select(f => f.ID).ToList();

                // Lấy tất cả kết quả khám liên quan
                var results = await _resultService.GetHealthCheckResultsByConsentIdsAsync(consentIds);
                return Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHistoryByParent for parentId {parentId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class BatchHealthCheckCreateModel
    {
        public string? PlanName { get; set; }
        public string? ClassID { get; set; }
        public string? CheckupDate { get; set; }
        public string? CheckupContent { get; set; }
        public string? Status { get; set; }
        public string? CreatorID { get; set; }
        public string? Notes { get; set; }
        public List<string>? StudentIds { get; set; }
    }
}