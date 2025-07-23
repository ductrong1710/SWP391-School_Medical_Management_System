using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services;
using Services.Interfaces;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaccineTypeController : ControllerBase
    {
        private readonly IVaccineTypeService _vaccineTypeService;

        public VaccineTypeController(IVaccineTypeService vaccineTypeService)
        {
            _vaccineTypeService = vaccineTypeService;
        }

        // GET: api/VaccineType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VaccineType>>> GetVaccineTypes()
        {
            var vaccineTypes = await _vaccineTypeService.GetAllVaccineTypesAsync();
            return Ok(vaccineTypes);
        }

        // GET: api/VaccineType/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VaccineType>> GetVaccineType(string id)
        {
            var vaccineType = await _vaccineTypeService.GetVaccineTypeByIdAsync(id);
            if (vaccineType == null)
                return NotFound();

            return Ok(vaccineType);
        }

        // POST: api/VaccineType
        [HttpPost]
        public async Task<ActionResult<VaccineType>> CreateVaccineType(VaccineType vaccineType)
        {
            try
            {
                var createdVaccineType = await _vaccineTypeService.CreateVaccineTypeAsync(vaccineType);
                return CreatedAtAction(nameof(GetVaccineType), new { id = createdVaccineType.VaccinationID }, createdVaccineType);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        // PUT: api/VaccineType/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVaccineType(string id, VaccineType vaccineType)
        {
            if (id != vaccineType.VaccinationID)
                return BadRequest();

            await _vaccineTypeService.UpdateVaccineTypeAsync(id, vaccineType);
            return NoContent();
        }

        // DELETE: api/VaccineType/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVaccineType(string id)
        {
            await _vaccineTypeService.DeleteVaccineTypeAsync(id);
            return NoContent();
        }
    }
}