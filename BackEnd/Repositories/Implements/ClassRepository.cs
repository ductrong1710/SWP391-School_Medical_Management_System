using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class SchoolClassRepository : ISchoolClassRepository
{
    private readonly ApplicationDbContext _context;
    public SchoolClassRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SchoolClass>> GetAllSchoolClassesAsync()
    {
        return await _context.SchoolClasses.ToListAsync();
    }

    public async Task<IEnumerable<Profile>> GetStudentsByClassIdAsync(string classId)
    {
        return await _context.Profiles
            .Where(p => p.ClassID == classId)
            .ToListAsync();
    }
} 