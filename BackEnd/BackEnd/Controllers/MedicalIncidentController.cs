using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalIncidentController : ControllerBase
    {
        private readonly IMedicalIncidentService _medicalIncidentService;

        public MedicalIncidentController(IMedicalIncidentService medicalIncidentService)
        {
            _medicalIncidentService = medicalIncidentService;
        }

        // GET: api/MedicalIncident
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicalIncident>>> GetMedicalIncidents()
        {
            var incidents = await _medicalIncidentService.GetAllMedicalIncidentsAsync();
            return Ok(incidents);
        }

        // GET: api/MedicalIncident/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalIncident>> GetMedicalIncident(string id)
        {
            var incident = await _medicalIncidentService.GetMedicalIncidentByIdAsync(id);
            if (incident == null)
                return NotFound();
            return Ok(incident);
        }

        public class MedicalIncidentRequestDto
        {
            public MedicalIncident Incident { get; set; }
            public List<IncidentInvolvement> Involvements { get; set; }
            public List<SupplyMedUsage> Usages { get; set; }
        }

        // POST: api/MedicalIncident
        [HttpPost]
        public async Task<ActionResult<MedicalIncident>> CreateMedicalIncident([FromBody] MedicalIncidentRequestDto request)
        {
            var createdIncident = await _medicalIncidentService.CreateMedicalIncidentAsync(request.Incident, request.Involvements, request.Usages);
            return CreatedAtAction(nameof(GetMedicalIncident), new { id = createdIncident.IncidentID }, createdIncident);
        }

        // PUT: api/MedicalIncident/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedicalIncident(string id, [FromBody] MedicalIncidentRequestDto request)
        {
            if (id != request.Incident.IncidentID)
                return BadRequest();
            await _medicalIncidentService.UpdateMedicalIncidentAsync(id, request.Incident, request.Involvements, request.Usages);
            return NoContent();
        }

        // DELETE: api/MedicalIncident/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicalIncident(string id)
        {
            await _medicalIncidentService.DeleteMedicalIncidentAsync(id);
            return NoContent();
        }

        // GET: api/MedicalIncident/student/{studentId}/history
        [HttpGet("student/{studentId}/history")]
        public async Task<ActionResult<IEnumerable<MedicalIncident>>> GetIncidentHistoryByStudent(string studentId)
        {
            var incidents = await _medicalIncidentService.GetIncidentHistoryByStudentAsync(studentId);
            return Ok(incidents);
        }

        // GET: api/MedicalIncident/parent/{parentId}/history
        [HttpGet("parent/{parentId}/history")]
        public async Task<ActionResult<IEnumerable<MedicalIncident>>> GetIncidentHistoryByParent(string parentId)
        {
            var incidents = await _medicalIncidentService.GetIncidentHistoryByParentAsync(parentId);
            return Ok(incidents);
        }
    }
} 