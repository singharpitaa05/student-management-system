import { Attendance } from '../../models/attendance.model.js';
import { Course } from '../../models/course.model.js';
import ApiError from '../../utils/apiError.js';

export const attendanceService = {
  async markAttendance(data, markedBy) {
    const { courseId, date, records } = data;

    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found');

    // Check if attendance already marked for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      course: courseId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (attendance) {
      // Update existing
      attendance.records = records;
      attendance.markedBy = markedBy;
      await attendance.save();
    } else {
      // Create new
      attendance = await Attendance.create({
        course: courseId,
        date,
        markedBy,
        records,
      });
    }

    return attendance;
  },

  async getAttendance(courseId, date) {
    let filter = { course: courseId };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    return await Attendance.find(filter)
      .populate('markedBy', 'name')
      .populate('records.student', 'name rollNumber');
  },

  async getStudentAttendance(studentId, courseId) {
    let filter = { 'records.student': studentId };
    if (courseId) filter.course = courseId;

    const attendances = await Attendance.find(filter)
      .populate('course', 'name code')
      .sort({ date: -1 });

    // Format for easier consumption by student
    return attendances.map(att => {
      const record = att.records.find(r => r.student.toString() === studentId);
      return {
        _id: att._id,
        date: att.date,
        course: att.course,
        status: record.status,
        remarks: record.remarks
      };
    });
  }
};
