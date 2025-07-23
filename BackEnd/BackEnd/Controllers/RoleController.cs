using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services;
using Services.Interfaces;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        // GET: api/Role
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }

        // GET: api/Role/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRole(string id)
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
                return NotFound();

            return Ok(role);
        }

        // GET: api/Role/type/{roleType}
        [HttpGet("type/{roleType}")]
        public async Task<ActionResult<Role>> GetRoleByType(string roleType)
        {
            var role = await _roleService.GetRoleByTypeAsync(roleType);

            if (role == null)
            {
                return NotFound();
            }

            return role;
        }

        // POST: api/Role
        [HttpPost]
        public async Task<ActionResult<Role>> CreateRole(Role role)
        {
            try
            {
                var createdRole = await _roleService.CreateRoleAsync(role);
                return CreatedAtAction(nameof(GetRole), new { id = createdRole.RoleID }, createdRole);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        // PUT: api/Role/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(string id, Role role)
        {
            if (id != role.RoleID)
                return BadRequest();

            await _roleService.UpdateRoleAsync(id, role);
            return NoContent();
        }

        // DELETE: api/Role/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            await _roleService.DeleteRoleAsync(id);
            return NoContent();
        }
    }
}