import { dashboardController } from './dashboard.controller.js';
import { dashboardSchema } from './dashboard.schema.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

export default async function dashboardRoutes(fastify, options) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get(
    '/admin',
    { schema: dashboardSchema, preHandler: authorize('admin') },
    dashboardController.getAdminDashboard
  );

  fastify.get(
    '/teacher',
    { schema: dashboardSchema, preHandler: authorize('teacher') },
    dashboardController.getTeacherDashboard
  );

  fastify.get(
    '/student',
    { schema: dashboardSchema, preHandler: authorize('student') },
    dashboardController.getStudentDashboard
  );
}
