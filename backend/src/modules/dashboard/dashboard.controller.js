import { dashboardService } from './dashboard.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const dashboardController = {
  async getAdminDashboard(request, reply) {
    const data = await dashboardService.getAdminStats();
    reply.send(new ApiResponse(200, data, 'Admin dashboard stats retrieved'));
  },

  async getTeacherDashboard(request, reply) {
    const data = await dashboardService.getTeacherStats(request.user.userId);
    reply.send(new ApiResponse(200, data, 'Teacher dashboard stats retrieved'));
  },

  async getStudentDashboard(request, reply) {
    const data = await dashboardService.getStudentStats(request.user.userId);
    reply.send(new ApiResponse(200, data, 'Student dashboard stats retrieved'));
  },
};
