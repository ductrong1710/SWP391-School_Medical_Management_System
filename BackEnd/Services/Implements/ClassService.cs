using Businessobjects.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public class SchoolClassService : ISchoolClassService
{
    private readonly ISchoolClassRepository _classRepository;
    public SchoolClassService(ISchoolClassRepository classRepository)
    {
        _classRepository = classRepository;
    }

    public Task<IEnumerable<SchoolClass>> GetAllSchoolClassesAsync() => _classRepository.GetAllSchoolClassesAsync();
    public Task<IEnumerable<Profile>> GetStudentsByClassIdAsync(string classId) => _classRepository.GetStudentsByClassIdAsync(classId);
} 