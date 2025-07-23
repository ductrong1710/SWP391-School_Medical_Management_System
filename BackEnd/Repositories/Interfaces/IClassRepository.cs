using Businessobjects.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface ISchoolClassRepository
{
    Task<IEnumerable<SchoolClass>> GetAllSchoolClassesAsync();
    Task<IEnumerable<Profile>> GetStudentsByClassIdAsync(string classId);
} 