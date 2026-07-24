import { teacherController } from './teacher.controller.js';
import * as schemas from './teacher.schema.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

export default async function teacherRoutes(fastify, options) {
  // All routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post('/', { schema: schemas.createTeacherSchema, preHandler: authorize('admin') }, teacherController.create);
  fastify.get('/', { preHandler: authorize('admin', 'teacher', 'student') }, teacherController.getAll);
  fastify.get('/:id', { schema: schemas.getTeacherSchema, preHandler: authorize('admin', 'teacher', 'student') }, teacherController.getById);
  fastify.patch('/:id', { schema: schemas.updateTeacherSchema, preHandler: authorize('admin') }, teacherController.update);
  fastify.delete('/:id', { schema: schemas.getTeacherSchema, preHandler: authorize('admin') }, teacherController.delete);
}
