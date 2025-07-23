using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using Services.Interfaces;
using Repositories.Interfaces;
using System.Threading.Tasks;
using Services.Interfaces;
using System.Linq;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IRoleRepository _roleRepository;
        private readonly IProfileService _profileService;
        private readonly ISchoolClassService _schoolClassService;

        public AuthController(IUserService userService, IRoleRepository roleRepository, IProfileService profileService, ISchoolClassService schoolClassService)
        {
            _userService = userService;
            _roleRepository = roleRepository;
            _profileService = profileService;
            _schoolClassService = schoolClassService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            // Log để kiểm tra request
            System.Console.WriteLine($"--- Attempting login for user: {loginRequest.Username} ---");

            var user = await _userService.GetUserByUsernameAsync(loginRequest.Username);
            
            if (user == null)
            {
                System.Console.WriteLine($"DEBUG: User '{loginRequest.Username}' not found.");
                return Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng");
            }

            if (user.Password.Trim() != loginRequest.Password.Trim())
            {
                System.Console.WriteLine($"DEBUG: Password mismatch for user '{loginRequest.Username}'.");
                return Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng");
            }
            
            System.Console.WriteLine($"--- Login successful for user: {loginRequest.Username} ---");

            // Lấy thông tin lớp học nếu có
            var profile = await _profileService.GetProfileByUserIdAsync(user.UserID);
            object? classInfo = null;
            if (profile != null && !string.IsNullOrEmpty(profile.ClassID))
            {
                var allClasses = await _schoolClassService.GetAllSchoolClassesAsync();
                var schoolClass = allClasses.FirstOrDefault(c => c.ClassID == profile.ClassID);
                if (schoolClass != null)
                {
                    classInfo = new {
                        ClassID = schoolClass.ClassID,
                        ClassName = schoolClass.ClassName,
                        Grade = schoolClass.Grade
                    };
                }
            }

            // Tạo response object với thông tin user, role và class
            var response = new
            {
                UserID = user.UserID,
                Username = user.Username,
                RoleID = user.RoleID,
                RoleType = user.Role?.RoleType ?? "Unknown",
                Class = classInfo
            };

            return Ok(response);
        }
    }
} 