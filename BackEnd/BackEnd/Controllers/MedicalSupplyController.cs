using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services;
using Services.Interfaces;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalSupplyController : ControllerBase
    {
        private readonly IMedicalSupplyService _service;

        public MedicalSupplyController(IMedicalSupplyService service)
        {
            _service = service;
        }

        // GET: api/MedicalSupply
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicalSupply>>> GetMedicalSupplies()
        {
            var supplies = await _service.GetAllSuppliesAsync();
            return Ok(supplies);
        }

        // GET: api/MedicalSupply/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalSupply>> GetSupply(string id)
        {
            var supply = await _service.GetSupplyByIdAsync(id);
            if (supply == null)
                return NotFound();

            return Ok(supply);
        }

        // POST: api/MedicalSupply
        [HttpPost]
        public async Task<ActionResult<MedicalSupply>> PostMedicalSupply(MedicalSupply supply)
        {
            var createdSupply = await _service.AddSupplyAsync(supply);
            return CreatedAtAction(nameof(GetSupply), new { id = createdSupply.SupplyID }, createdSupply);
        }

        // PUT: api/MedicalSupply/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupply(string id, MedicalSupply supply)
        {
            if (id != supply.SupplyID)
                return BadRequest();

            await _service.UpdateSupplyAsync(id, supply);
            return NoContent();
        }

        // DELETE: api/MedicalSupply/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupply(string id)
        {
            await _service.DeleteSupplyAsync(id);
            return NoContent();
        }
    }
}