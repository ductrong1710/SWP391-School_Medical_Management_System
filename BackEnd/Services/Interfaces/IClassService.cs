using Businessobjects.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface ISchoolClassService
{
    Task<IEnumerable<SchoolClass>> GetAllSchoolClassesAsync();
    Task<IEnumerable<Profile>> GetStudentsByClassIdAsync(string classId);
} 