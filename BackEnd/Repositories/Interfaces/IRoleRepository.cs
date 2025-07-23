using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<IEnumerable<Role>> GetAllRolesAsync();
        Task<Role?> GetRoleByIdAsync(string id);
        Task<Role?> GetRoleByTypeAsync(string roleType);
        Task CreateRoleAsync(Role role);
        Task UpdateRoleAsync(Role role);
        Task DeleteRoleAsync(string id);
        Task<bool> RoleExistsAsync(string id);
        Task<bool> RoleTypeExistsAsync(string roleType);
    }
}