using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services;
using Services.Interfaces;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        // GET: api/Profile
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Profile>>> GetProfiles()
        {
            var profiles = await _profileService.GetAllProfilesAsync();
            return Ok(profiles);
        }

        // GET: api/Profile/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Profile>> GetProfile(string id)
        {
            var profile = await _profileService.GetProfileByIdAsync(id);
            if (profile == null)
                return NotFound();

            return Ok(profile);
        }

        // GET: api/Profile/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<Profile>> GetProfileByUser(string userId)
        {
            var profile = await _profileService.GetProfileByUserIdAsync(userId);
            if (profile == null)
                return NotFound();

            return Ok(profile);
        }

        // GET: api/Profile/search?name=...&class=...
        [HttpGet("search")]
        public async Task<ActionResult<Profile>> SearchProfile([FromQuery] string name, [FromQuery] string @class)
        {
            var profile = await _profileService.FindProfileByNameAndClassAsync(name, @class);
            if (profile == null)
                return NotFound();
            return Ok(profile);
        }

        // POST: api/Profile
        [HttpPost]
        public async Task<ActionResult<Profile>> CreateProfile(Profile profile)
        {
            var createdProfile = await _profileService.CreateProfileAsync(profile);
            return CreatedAtAction(nameof(GetProfile), new { id = createdProfile.ProfileID }, createdProfile);
        }

        // PUT: api/Profile/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(string id, Profile profile)
        {
            if (id != profile.ProfileID)
                return BadRequest();

            await _profileService.UpdateProfileAsync(id, profile);
            return NoContent();
        }

        // DELETE: api/Profile/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfile(string id)
        {
            await _profileService.DeleteProfileAsync(id);
            return NoContent();
        }
    }
}