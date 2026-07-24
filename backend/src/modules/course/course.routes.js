import { courseController } from './course.controller.js';
import * as schemas from './course.schema.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

export default async function courseRoutes(fastify, options) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post('/', { schema: schemas.createCourseSchema, preHandler: authorize('admin', 'teacher') }, courseController.create);
  
  // All authenticated users can view courses (results filtered in service based on role)
  fastify.get('/', courseController.getAll);
  fastify.get('/:id', courseController.getById);

  fastify.post('/:id/enroll', { schema: schemas.enrollStudentSchema, preHandler: authorize('admin', 'student') }, courseController.enroll);
  fastify.post('/:id/remove', { schema: schemas.enrollStudentSchema, preHandler: authorize('admin') }, courseController.removeStudent);
}
