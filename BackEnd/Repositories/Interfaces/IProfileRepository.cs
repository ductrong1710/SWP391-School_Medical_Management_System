using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IProfileRepository
    {
        Task<IEnumerable<Profile>> GetAllProfilesAsync();
        Task<Profile?> GetProfileByIdAsync(string id);
        Task<Profile?> GetProfileByUserIdAsync(string userId);
        Task CreateProfileAsync(Profile profile);
        Task UpdateProfileAsync(Profile profile);
        Task DeleteProfileAsync(string id);
        Task<bool> ProfileExistsAsync(string id);
    }
}