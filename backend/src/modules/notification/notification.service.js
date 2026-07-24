import { Notification } from '../../models/notification.model.js';
import { User } from '../../models/user.model.js';
import ApiError from '../../utils/apiError.js';

export const notificationService = {
  async getUserNotifications(userId, unreadOnly, limit = 20) {
    const filter = { recipient: userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    return await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
  },

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) throw new ApiError(404, 'Notification not found');
    return notification;
  },
  
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  },

  async sendNotification(data) {
    const { recipients, role, title, message, type, actionUrl } = data;
    let targetUserIds = [];

    if (recipients && recipients.length > 0) {
      targetUserIds = recipients;
    } else if (role) {
      const filter = role === 'all' ? {} : { role };
      const users = await User.find(filter).select('_id');
      targetUserIds = users.map(u => u._id);
    } else {
      throw new ApiError(400, 'Must specify either recipients or a role');
    }

    const notifications = targetUserIds.map(userId => ({
      recipient: userId,
      title,
      message,
      type,
      actionUrl
    }));

    await Notification.insertMany(notifications);
    return { count: notifications.length };
  }
};
