import { attendanceController } from './attendance.controller.js';
import * as schemas from './attendance.schema.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

export default async function attendanceRoutes(fastify, options) {
  fastify.addHook('preHandler', fastify.authenticate);

  // Admin and teacher can mark attendance
  fastify.post('/', { schema: schemas.markAttendanceSchema, preHandler: authorize('admin', 'teacher') }, attendanceController.mark);
  
  // Admin and teacher can view course attendance
  fastify.get('/', { schema: schemas.getAttendanceSchema, preHandler: authorize('admin', 'teacher') }, attendanceController.get);

  // Any authenticated user can get a student's attendance (controller handles ownership check)
  fastify.get('/student/:studentId', { schema: schemas.getStudentAttendanceSchema }, attendanceController.getStudent);
}
