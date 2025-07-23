using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implements
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        public NotificationService(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(string userId)
        {
            return await _notificationRepository.GetNotificationsByUserIdAsync(userId);
        }

        public async Task<Notification?> GetNotificationByIdAsync(string notificationId)
        {
            return await _notificationRepository.GetNotificationByIdAsync(notificationId);
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            await _notificationRepository.CreateNotificationAsync(notification);
            return notification;
        }

        public async Task MarkAsReadAsync(string notificationId)
        {
            await _notificationRepository.MarkAsReadAsync(notificationId);
        }
    }
} 