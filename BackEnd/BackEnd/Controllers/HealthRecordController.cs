using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services.Interfaces;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthRecordController : ControllerBase
    {
        private readonly IHealthRecordService _healthRecordService;

        public HealthRecordController(IHealthRecordService healthRecordService)
        {
            _healthRecordService = healthRecordService;
        }

        // GET: api/HealthRecord
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HealthRecord>>> GetHealthRecords()
        {
            var healthRecords = await _healthRecordService.GetAllHealthRecordsAsync();
            return Ok(healthRecords);
        }

        // GET: api/HealthRecord/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HealthRecord>> GetHealthRecord(string id)
        {
            var healthRecord = await _healthRecordService.GetHealthRecordByIdAsync(id);
            if (healthRecord == null)
                return NotFound();

            return Ok(healthRecord);
        }

        // GET: api/HealthRecord/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<HealthRecord>> GetHealthRecordByStudent(string studentId)
        {
            var healthRecord = await _healthRecordService.GetHealthRecordByStudentIdAsync(studentId);
            if (healthRecord == null)
                return NotFound();

            return Ok(healthRecord);
        }

        // POST: api/HealthRecord
        [HttpPost]
        public async Task<ActionResult<HealthRecord>> CreateHealthRecord(HealthRecord healthRecord)
        {
            if (!ModelState.IsValid)
            {
                Console.WriteLine("[LOG] ModelState errors: " + string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }
            Console.WriteLine("[LOG] POST /api/HealthRecord payload: " + System.Text.Json.JsonSerializer.Serialize(healthRecord));
            var createdHealthRecord = await _healthRecordService.CreateHealthRecordAsync(healthRecord);
            return Ok(createdHealthRecord);
        }

        // PUT: api/HealthRecord/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHealthRecord(string id, HealthRecord healthRecord)
        {
            if (id != healthRecord.HealthRecordID)
                return BadRequest();

            await _healthRecordService.UpdateHealthRecordAsync(id, healthRecord);
            return NoContent();
        }

        // DELETE: api/HealthRecord/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHealthRecord(string id)
        {
            await _healthRecordService.DeleteHealthRecordAsync(id);
            return NoContent();
        }
    }
}