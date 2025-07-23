using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface IBlogService
    {
        Task<IEnumerable<BlogDocument>> GetAllBlogsAsync();
        Task<BlogDocument?> GetBlogByIdAsync(int id);
        Task<BlogDocument> CreateBlogAsync(BlogDocument blog);
        Task<BlogDocument> UpdateBlogAsync(BlogDocument blog);
        Task<bool> DeleteBlogAsync(int id);
    }
} 