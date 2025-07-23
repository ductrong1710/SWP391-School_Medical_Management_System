using Businessobjects.Models;

namespace Services.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(string userId);
        Task<Notification?> GetNotificationByIdAsync(string notificationId);
        Task<Notification> CreateNotificationAsync(Notification notification);
        Task MarkAsReadAsync(string notificationId);
    }
} 