using Businessobjects.Models;

namespace Repositories.Interfaces
{
    public interface INotificationRepository
    {
        Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(string userId);
        Task<Notification?> GetNotificationByIdAsync(string notificationId);
        Task<Notification> CreateNotificationAsync(Notification notification);
        Task MarkAsReadAsync(string notificationId);
    }
} 