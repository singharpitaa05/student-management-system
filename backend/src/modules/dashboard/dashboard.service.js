import { Student } from '../../models/student.model.js';
import { Teacher } from '../../models/teacher.model.js';
import { Course } from '../../models/course.model.js';
import { Attendance } from '../../models/attendance.model.js';

export const dashboardService = {
  async getAdminStats() {
    const totalStudents = await Student.countDocuments({ role: 'student' });
    const totalTeachers = await Teacher.countDocuments({ role: 'teacher' });
    const pendingFees = await Student.countDocuments({ role: 'student', feeStatus: 'pending' });
    const paidFees = await Student.countDocuments({ role: 'student', feeStatus: 'paid' });
    const overdueFees = await Student.countDocuments({ role: 'student', feeStatus: 'overdue' });
    
    // Recent registrations
    const recentStudents = await Student.find({ role: 'student' })
      .select('name email rollNumber createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      stats: {
        totalStudents,
        totalTeachers,
        pendingFees,
        paidFees,
        overdueFees,
      },
      recentStudents,
    };
  },

  async getTeacherStats(teacherId) {
    const teacher = await Teacher.findById(teacherId).populate('assignedCourses');
    if (!teacher) throw new Error('Teacher not found');

    const courseIds = teacher.assignedCourses.map(c => c._id);
    const courseCount = courseIds.length;
    
    // Get total students in these courses
    let totalStudentsInCourses = 0;
    teacher.assignedCourses.forEach(c => {
      totalStudentsInCourses += c.students.length;
    });

    // Calculate average attendance for these courses
    let averageAttendance = 0;
    if (courseIds.length > 0) {
      const attendances = await Attendance.find({ course: { $in: courseIds } });
      const presentCount = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
      if (attendances.length > 0) {
        averageAttendance = Math.round((presentCount / attendances.length) * 100);
      }
    }

    return {
      stats: {
        assignedCourses: courseCount,
        totalStudentsInCourses,
        averageAttendance,
      },
      assignedCourses: teacher.assignedCourses.slice(0, 5) // Recent 5 courses
    };
  },

  async getStudentStats(studentId) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found');

    const courses = await Course.find({ students: studentId });
    const enrolledCourses = courses.length;

    const attendances = await Attendance.find({ student: studentId });
    const presentCount = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const averageAttendance = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0;

    const recentAttendance = await Attendance.find({ student: studentId })
      .populate('course', 'name code')
      .sort({ date: -1 })
      .limit(5);

    return {
      stats: {
        enrolledCourses,
        averageAttendance,
        feeStatus: student.feeStatus,
      },
      recentAttendance
    };
  }
};
