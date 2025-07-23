using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllUsersAsync();
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _userRepository.GetUserByIdAsync(id);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _userRepository.GetUserByUsernameAsync(username);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            await _userRepository.CreateUserAsync(user);
            return user;
        }

        public async Task UpdateUserAsync(string id, User user)
        {
            if (id != user.UserID)
                throw new ArgumentException("ID mismatch");

            if (!await _userRepository.UserExistsAsync(id))
                throw new KeyNotFoundException("User not found");

            await _userRepository.UpdateUserAsync(user);
        }

        public async Task DeleteUserAsync(string id)
        {
            if (!await _userRepository.UserExistsAsync(id))
                throw new KeyNotFoundException("User not found");

            await _userRepository.DeleteUserAsync(id);
        }

        public async Task<IEnumerable<User>> GetChildrenByParentIdAsync(string parentId)
        {
            return await _userRepository.GetChildrenByParentIdAsync(parentId);
        }
    }
}