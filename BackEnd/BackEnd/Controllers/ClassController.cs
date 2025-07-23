using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using System.Threading.Tasks;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class SchoolClassController : ControllerBase
{
    private readonly ISchoolClassService _classService;
    public SchoolClassController(ISchoolClassService classService)
    {
        _classService = classService;
    }

    // GET: api/SchoolClass
    [HttpGet]
    public async Task<IActionResult> GetSchoolClasses()
    {
        var classes = await _classService.GetAllSchoolClassesAsync();
        return Ok(classes);
    }

    // GET: api/SchoolClass/{classId}/students
    [HttpGet("{classId}/students")]
    public async Task<IActionResult> GetStudentsByClass(string classId)
    {
        var students = await _classService.GetStudentsByClassIdAsync(classId);
        var result = students.Select(s => new {
            UserID = s.UserID,
            Name = s.Name,
            ProfileID = s.ProfileID
        });
        return Ok(result);
    }
} 