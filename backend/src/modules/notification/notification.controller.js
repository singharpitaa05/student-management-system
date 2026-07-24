import { notificationService } from './notification.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const notificationController = {
  async getMyNotifications(request, reply) {
    const { unreadOnly, limit } = request.query;
    const notifications = await notificationService.getUserNotifications(request.user.userId, unreadOnly, limit);
    reply.send(new ApiResponse(200, notifications, 'Notifications retrieved'));
  },

  async markAsRead(request, reply) {
    const notification = await notificationService.markAsRead(request.params.id, request.user.userId);
    reply.send(new ApiResponse(200, notification, 'Notification marked as read'));
  },

  async markAllAsRead(request, reply) {
    await notificationService.markAllAsRead(request.user.userId);
    reply.send(new ApiResponse(200, null, 'All notifications marked as read'));
  },

  async send(request, reply) {
    const result = await notificationService.sendNotification(request.body);
    reply.status(201).send(new ApiResponse(201, result, `Sent ${result.count} notifications`));
  }
};
