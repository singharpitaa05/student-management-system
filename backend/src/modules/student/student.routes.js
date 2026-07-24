import { studentController } from './student.controller.js';
import * as schemas from './student.schema.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

export default async function studentRoutes(fastify, options) {
  fastify.addHook('preHandler', fastify.authenticate);

  // Export routes (must be before /:id routes to avoid param collision)
  fastify.get('/export/excel', { preHandler: authorize('admin', 'teacher') }, studentController.exportExcel);
  fastify.get('/export/pdf', { preHandler: authorize('admin', 'teacher') }, studentController.exportPDF);

  // Admin/Teacher can create and list students
  fastify.post(
    '/',
    { schema: schemas.createStudentSchema, preHandler: authorize('admin', 'teacher') },
    studentController.create
  );
  
  fastify.get(
    '/',
    { schema: schemas.listStudentsSchema, preHandler: authorize('admin', 'teacher') },
    studentController.getAll
  );

  // Any authenticated user can get a profile (ownership check is in the controller)
  fastify.get('/:id', { schema: schemas.getStudentSchema }, studentController.getById);

  // Any authenticated user can update a profile (ownership check is in the controller)
  fastify.patch('/:id', { schema: schemas.updateStudentSchema }, studentController.update);

  // Only admin can delete a student
  fastify.delete(
    '/:id',
    { schema: schemas.getStudentSchema, preHandler: authorize('admin') },
    studentController.delete
  );
}
