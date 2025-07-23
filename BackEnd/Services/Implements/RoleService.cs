using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<IEnumerable<Role>> GetAllRolesAsync()
        {
            return await _roleRepository.GetAllRolesAsync();
        }

        public async Task<Role?> GetRoleByIdAsync(string id)
        {
            return await _roleRepository.GetRoleByIdAsync(id);
        }

        public async Task<Role?> GetRoleByTypeAsync(string roleType)
        {
            return await _roleRepository.GetRoleByTypeAsync(roleType);
        }

        public async Task<Role> CreateRoleAsync(Role role)
        {
            if (await _roleRepository.RoleTypeExistsAsync(role.RoleType))
                throw new InvalidOperationException("Role type already exists");

            await _roleRepository.CreateRoleAsync(role);
            return role;
        }

        public async Task UpdateRoleAsync(string id, Role role)
        {
            if (id != role.RoleID)
                throw new ArgumentException("ID mismatch");

            if (!await _roleRepository.RoleExistsAsync(id))
                throw new KeyNotFoundException("Role not found");

            var existingRole = await _roleRepository.GetRoleByTypeAsync(role.RoleType);
            if (existingRole != null && existingRole.RoleID != id)
                throw new InvalidOperationException("Role type already exists");

            await _roleRepository.UpdateRoleAsync(role);
        }

        public async Task DeleteRoleAsync(string id)
        {
            if (!await _roleRepository.RoleExistsAsync(id))
                throw new KeyNotFoundException("Role not found");

            await _roleRepository.DeleteRoleAsync(id);
        }
    }
}