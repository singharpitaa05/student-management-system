import { attendanceService } from './attendance.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const attendanceController = {
  async mark(request, reply) {
    const attendance = await attendanceService.markAttendance(request.body, request.user.userId);
    reply.status(201).send(new ApiResponse(201, attendance, 'Attendance marked successfully'));
  },

  async get(request, reply) {
    const { courseId, date } = request.query;
    const attendance = await attendanceService.getAttendance(courseId, date);
    reply.send(new ApiResponse(200, attendance, 'Attendance retrieved'));
  },

  async getStudent(request, reply) {
    // Basic ownership check
    if (request.user.role === 'student' && request.user.userId !== request.params.studentId) {
      return reply.status(403).send(new ApiResponse(403, null, 'Forbidden'));
    }

    const { courseId } = request.query;
    const attendance = await attendanceService.getStudentAttendance(request.params.studentId, courseId);
    reply.send(new ApiResponse(200, attendance, 'Student attendance retrieved'));
  }
};
