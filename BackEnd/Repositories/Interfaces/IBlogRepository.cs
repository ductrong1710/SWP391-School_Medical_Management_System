using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface IBlogRepository
    {
        Task<IEnumerable<BlogDocument>> GetAllAsync();
        Task<BlogDocument?> GetByIdAsync(int id);
        Task<BlogDocument> AddAsync(BlogDocument blog);
        Task<BlogDocument> UpdateAsync(BlogDocument blog);
        Task<bool> DeleteAsync(string id);
    }
} 