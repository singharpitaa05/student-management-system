import { notificationController } from './notification.controller.js';
import * as schemas from './notification.schema.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

export default async function notificationRoutes(fastify, options) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', { schema: schemas.getNotificationsSchema }, notificationController.getMyNotifications);
  fastify.patch('/:id/read', { schema: schemas.markAsReadSchema }, notificationController.markAsRead);
  fastify.patch('/read-all', notificationController.markAllAsRead);

  // Only admin can send bulk notifications
  fastify.post('/send', { schema: schemas.sendNotificationSchema, preHandler: authorize('admin') }, notificationController.send);
}
