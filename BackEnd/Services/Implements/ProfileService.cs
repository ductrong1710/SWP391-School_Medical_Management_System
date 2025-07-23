using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive
using Microsoft.EntityFrameworkCore;
using Businessobjects.Data;

namespace Services.Implements
{
    public class ProfileService : IProfileService
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ApplicationDbContext _context;

        public ProfileService(IProfileRepository profileRepository, ApplicationDbContext context)
        {
            _profileRepository = profileRepository;
            _context = context;
        }

        public async Task<IEnumerable<Profile>> GetAllProfilesAsync()
        {
            return await _profileRepository.GetAllProfilesAsync();
        }

        public async Task<Profile?> GetProfileByIdAsync(string id)
        {
            return await _profileRepository.GetProfileByIdAsync(id);
        }

        public async Task<Profile?> GetProfileByUserIdAsync(string userId)
        {
            return await _profileRepository.GetProfileByUserIdAsync(userId);
        }

        public async Task<Profile> CreateProfileAsync(Profile profile)
        {
            await _profileRepository.CreateProfileAsync(profile);
            return profile;
        }

        public async Task UpdateProfileAsync(string id, Profile profile)
        {
            if (id != profile.ProfileID)
                throw new ArgumentException("ID mismatch");

            if (!await _profileRepository.ProfileExistsAsync(id))
                throw new KeyNotFoundException("Profile not found");

            await _profileRepository.UpdateProfileAsync(profile);
        }

        public async Task DeleteProfileAsync(string id)
        {
            if (!await _profileRepository.ProfileExistsAsync(id))
                throw new KeyNotFoundException("Profile not found");

            await _profileRepository.DeleteProfileAsync(id);
        }

        public async Task<Profile?> FindProfileByNameAndClassAsync(string name, string @class)
        {
            Console.WriteLine($"[LOG] FindProfileByNameAndClassAsync - original: name: '{name}', class: '{@class}'");
            var nameNormalized = name.Trim().ToLower();
            var classNormalized = @class.Trim().ToLower();
            Console.WriteLine($"[LOG] FindProfileByNameAndClassAsync - normalized: name: '{nameNormalized}', class: '{classNormalized}'");
            return await _context.Profiles
                .FirstOrDefaultAsync(p =>
                    p.Name != null && p.ClassID != null &&
                    p.Name.Trim().ToLower() == nameNormalized &&
                    p.ClassID.Trim().ToLower() == classNormalized
                );
        }
    }
}