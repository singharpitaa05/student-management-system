import ApiResponse from '../../utils/apiResponse.js';
import { exportToExcel, exportToPDF } from '../../utils/export.js';
import { studentService } from './student.service.js';

export const studentController = {
  async create(request, reply) {
    const student = await studentService.createStudent(request.body);
    reply.status(201).send(new ApiResponse(201, student, 'Student created successfully'));
  },

  async getAll(request, reply) {
    const data = await studentService.getAllStudents(request.query);
    reply.send(new ApiResponse(200, data, 'Students retrieved successfully'));
  },

  async getById(request, reply) {
    // Basic ownership check - student can only get their own profile, unless admin/teacher
    if (request.user.role === 'student' && request.user.userId !== request.params.id) {
      return reply.status(403).send(new ApiResponse(403, null, 'Forbidden, you can only view your own profile'));
    }
    
    const student = await studentService.getStudentById(request.params.id);
    reply.send(new ApiResponse(200, student, 'Student retrieved successfully'));
  },

  async update(request, reply) {
    // Basic ownership check - student can only update their own profile, unless admin
    if (request.user.role === 'student' && request.user.userId !== request.params.id) {
      return reply.status(403).send(new ApiResponse(403, null, 'Forbidden, you can only update your own profile'));
    }

    const student = await studentService.updateStudent(request.params.id, request.body);
    reply.send(new ApiResponse(200, student, 'Student updated successfully'));
  },

  async delete(request, reply) {
    await studentService.deleteStudent(request.params.id);
    reply.send(new ApiResponse(200, null, 'Student deleted successfully'));
  },

  async exportExcel(request, reply) {
    const students = await studentService.getAllStudents({}, { page: 1, limit: 10000 });
    
    const columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Batch', key: 'batch', width: 15 },
      { header: 'Fee Status', key: 'feeStatus', width: 15 },
      { header: 'Joined', key: 'createdAt', width: 20 },
    ];

    const data = students.students.map(s => ({
      name: s.name,
      email: s.email,
      rollNumber: s.rollNumber || '-',
      batch: s.batch || '-',
      feeStatus: s.feeStatus,
      createdAt: new Date(s.createdAt).toLocaleDateString()
    }));

    const buffer = await exportToExcel(data, columns);
    
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    reply.header('Content-Disposition', 'attachment; filename="students.xlsx"');
    reply.send(buffer);
  },

  async exportPDF(request, reply) {
    const students = await studentService.getAllStudents({}, { page: 1, limit: 10000 });
    
    const columns = [
      { header: 'Roll Number', key: 'rollNumber', width: 20 },
      { header: 'Name', key: 'name', width: 35 },
      { header: 'Batch', key: 'batch', width: 20 },
      { header: 'Fee Status', key: 'feeStatus', width: 20 },
    ];

    const data = students.students.map(s => ({
      rollNumber: s.rollNumber || '-',
      name: s.name,
      batch: s.batch || '-',
      feeStatus: s.feeStatus,
    }));

    const buffer = await exportToPDF(data, columns, 'Student List');
    
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', 'attachment; filename="students.pdf"');
    reply.send(buffer);
  }
};
