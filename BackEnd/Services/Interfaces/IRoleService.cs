using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IRoleService
    {
        Task<IEnumerable<Role>> GetAllRolesAsync();
        Task<Role?> GetRoleByIdAsync(string id);
        Task<Role?> GetRoleByTypeAsync(string roleType);
        Task<Role> CreateRoleAsync(Role role);
        Task UpdateRoleAsync(string id, Role role);
        Task DeleteRoleAsync(string id);
    }
}