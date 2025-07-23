using Businessobjects.Data;
using Businessobjects.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implements
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ApplicationDbContext _context;

        public RoleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Role>> GetAllRolesAsync()
        {
            return await _context.Role.ToListAsync();
        }

        public async Task<Role?> GetRoleByIdAsync(string id)
        {
            return await _context.Role.FirstOrDefaultAsync(r => r.RoleID == id);
        }

        public async Task<Role?> GetRoleByTypeAsync(string roleType)
        {
            return await _context.Role.FirstOrDefaultAsync(r => r.RoleType.ToLower() == roleType.ToLower());
        }

        public async Task CreateRoleAsync(Role role)
        {
            await _context.Role.AddAsync(role);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRoleAsync(Role role)
        {
            _context.Entry(role).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRoleAsync(string id)
        {
            var role = await GetRoleByIdAsync(id);
            if (role != null)
            {
                _context.Role.Remove(role);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> RoleExistsAsync(string id)
        {
            return await _context.Role.AnyAsync(r => r.RoleID == id);
        }

        public async Task<bool> RoleTypeExistsAsync(string roleType)
        {
            return await _context.Role.AnyAsync(r => r.RoleType.ToLower() == roleType.ToLower());
        }
    }
}