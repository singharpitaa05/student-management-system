import { courseService } from './course.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const courseController = {
  async create(request, reply) {
    const course = await courseService.createCourse(request.body);
    reply.status(201).send(new ApiResponse(201, course, 'Course created successfully'));
  },

  async getAll(request, reply) {
    const courses = await courseService.getAllCourses(request.query, request.user);
    reply.send(new ApiResponse(200, courses, 'Courses retrieved'));
  },

  async getById(request, reply) {
    const course = await courseService.getCourseById(request.params.id);
    reply.send(new ApiResponse(200, course, 'Course retrieved'));
  },

  async enroll(request, reply) {
    const { studentId } = request.body;
    
    // Security check: Students can only enroll themselves
    if (request.user.role === 'student' && studentId !== request.user.userId) {
      throw new ApiError(403, 'Students can only enroll themselves');
    }

    const course = await courseService.enrollStudent(request.params.id, studentId);
    reply.send(new ApiResponse(200, course, 'Student enrolled successfully'));
  },
  
  async removeStudent(request, reply) {
    const course = await courseService.removeStudent(request.params.id, request.body.studentId);
    reply.send(new ApiResponse(200, course, 'Student removed successfully'));
  }
};
