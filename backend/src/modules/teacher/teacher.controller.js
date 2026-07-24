import { teacherService } from './teacher.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const teacherController = {
  async create(request, reply) {
    const teacher = await teacherService.createTeacher(request.body);
    reply.status(201).send(new ApiResponse(201, teacher, 'Teacher created successfully'));
  },

  async getAll(request, reply) {
    const teachers = await teacherService.getAllTeachers();
    reply.send(new ApiResponse(200, teachers, 'Teachers retrieved successfully'));
  },

  async getById(request, reply) {
    const teacher = await teacherService.getTeacherById(request.params.id);
    reply.send(new ApiResponse(200, teacher, 'Teacher retrieved successfully'));
  },

  async update(request, reply) {
    const teacher = await teacherService.updateTeacher(request.params.id, request.body);
    reply.send(new ApiResponse(200, teacher, 'Teacher updated successfully'));
  },

  async delete(request, reply) {
    await teacherService.deleteTeacher(request.params.id);
    reply.send(new ApiResponse(200, null, 'Teacher deleted successfully'));
  },
};
