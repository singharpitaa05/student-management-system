import { Course } from '../../models/course.model.js';
import { Teacher } from '../../models/teacher.model.js';
import { Student } from '../../models/student.model.js';
import ApiError from '../../utils/apiError.js';
import mongoose from 'mongoose';

export const courseService = {
  async createCourse(data) {
    const existing = await Course.findOne({ code: data.code });
    if (existing) throw new ApiError(409, 'Course code already exists');

    const teacher = await Teacher.findById(data.teacher);
    if (!teacher || teacher.role !== 'teacher') {
      throw new ApiError(400, 'Invalid teacher ID');
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const course = await Course.create([data], { session });
      
      // Update teacher's assigned courses
      teacher.assignedCourses.push(course[0]._id);
      await teacher.save({ session });

      await session.commitTransaction();
      return course[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async getAllCourses(query, user) {
    let filter = {};
    
    // If student, only show active courses unless specified, or only their enrolled courses
    if (user.role === 'student' && query.enrolled === 'true') {
      filter.students = user.userId;
    }
    
    // If teacher, optionally show only their courses
    if (user.role === 'teacher' && query.assigned === 'true') {
      filter.teacher = user.userId;
    }

    return await Course.find(filter)
      .populate('teacher', 'name email')
      .select('-students'); // Exclude heavy student array by default
  },

  async getCourseById(id) {
    const course = await Course.findById(id)
      .populate('teacher', 'name email')
      .populate('students', 'name email rollNumber');
    
    if (!course) throw new ApiError(404, 'Course not found');
    return course;
  },

  async enrollStudent(courseId, studentId) {
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found');

    const student = await Student.findById(studentId);
    if (!student || student.role !== 'student') {
      throw new ApiError(400, 'Invalid student ID');
    }

    if (course.students.includes(studentId)) {
      throw new ApiError(400, 'Student already enrolled in this course');
    }

    course.students.push(studentId);
    await course.save();

    return course;
  },
  
  async removeStudent(courseId, studentId) {
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found');

    course.students = course.students.filter(id => id.toString() !== studentId);
    await course.save();

    return course;
  }
};
