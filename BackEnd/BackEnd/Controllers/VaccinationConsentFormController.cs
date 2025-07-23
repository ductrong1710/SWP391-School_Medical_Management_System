using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services;
using Services.Interfaces;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaccinationConsentFormController : ControllerBase
    {
        private readonly IVaccinationConsentFormService _consentFormService;

        public VaccinationConsentFormController(IVaccinationConsentFormService consentFormService)
        {
            _consentFormService = consentFormService;
        }

        // GET: api/VaccinationConsentForm
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VaccinationConsentForm>>> GetConsentForms()
        {
            var forms = await _consentFormService.GetAllVaccinationConsentFormsAsync();
            return Ok(forms);
        }

        // GET: api/VaccinationConsentForm/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VaccinationConsentForm>> GetVaccinationConsentForm(string id)
        {
            var form = await _consentFormService.GetVaccinationConsentFormByIdAsync(id);
            if (form == null)
                return NotFound();

            return Ok(form);
        }

        // GET: api/VaccinationConsentForm/plan/5
        [HttpGet("plan/{planId}")]
        public async Task<ActionResult<IEnumerable<VaccinationConsentForm>>> GetConsentFormsByPlan(string planId)
        {
            var forms = await _consentFormService.GetConsentFormsByPlanIdAsync(planId);
            return Ok(forms);
        }

        // GET: api/VaccinationConsentForm/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<VaccinationConsentForm>>> GetConsentFormsByStudent(string studentId)
        {
            var forms = await _consentFormService.GetConsentFormsByStudentIdAsync(studentId);
            return Ok(forms);
        }

        // GET: api/VaccinationConsentForm/plan/5/student/5
        [HttpGet("plan/{planId}/student/{studentId}")]
        public async Task<ActionResult<VaccinationConsentForm>> GetConsentFormByPlanAndStudent(string planId, string studentId)
        {
            var form = await _consentFormService.GetConsentFormByPlanAndStudentAsync(planId, studentId);
            if (form == null)
                return NotFound();

            return Ok(form);
        }

        // POST: api/VaccinationConsentForm
        [HttpPost]
        public async Task<ActionResult<VaccinationConsentForm>> CreateConsentForm(VaccinationConsentForm form)
        {
            try
            {
                var createdForm = await _consentFormService.CreateVaccinationConsentFormAsync(form);
                return CreatedAtAction(nameof(GetVaccinationConsentForm), new { id = createdForm.ID }, createdForm);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/VaccinationConsentForm/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConsentForm(string id, VaccinationConsentForm form)
        {
            if (id != form.ID)
                return BadRequest();

            await _consentFormService.UpdateVaccinationConsentFormAsync(id, form);
            return NoContent();
        }

        // DELETE: api/VaccinationConsentForm/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConsentForm(string id)
        {
            await _consentFormService.DeleteVaccinationConsentFormAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveConsentForm(string id)
        {
            var form = await _consentFormService.GetVaccinationConsentFormByIdAsync(id);
            if (form == null)
                return NotFound();

            form.ConsentStatus = "Approved";
            form.ResponseTime = DateTime.Now;
            await _consentFormService.UpdateVaccinationConsentFormAsync(id, form);

            return Ok(new { message = "Consent form approved!" });
        }

        public class DenyModel { public string? Reason { get; set; } }

        [HttpPost("{id}/deny")]
        public async Task<IActionResult> DenyConsentForm(string id, [FromBody] DenyModel model)
        {
            var form = await _consentFormService.GetVaccinationConsentFormByIdAsync(id);
            if (form == null)
                return NotFound();

            form.ConsentStatus = "Denied";
            form.ResponseTime = DateTime.Now;
            form.ReasonForDenial = model?.Reason;
            await _consentFormService.UpdateVaccinationConsentFormAsync(id, form);

            return Ok(new { message = "Consent form denied!" });
        }
    }
}