import { Teacher } from '../../models/teacher.model.js';
import { User } from '../../models/user.model.js';
import ApiError from '../../utils/apiError.js';

export const teacherService = {
  async createTeacher(data) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const teacherData = {
      ...data,
      role: 'teacher',
    };

    const teacher = await Teacher.create(teacherData);

    return {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      subjects: teacher.subjects,
    };
  },

  async getAllTeachers() {
    return await Teacher.find({ role: 'teacher' }).select('-password -refreshTokenHash');
  },

  async getTeacherById(id) {
    const teacher = await Teacher.findById(id).select('-password -refreshTokenHash');
    if (!teacher || teacher.role !== 'teacher') {
      throw new ApiError(404, 'Teacher not found');
    }
    return teacher;
  },

  async updateTeacher(id, updateData) {
    const teacher = await Teacher.findOneAndUpdate(
      { _id: id, role: 'teacher' },
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokenHash');

    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }
    return teacher;
  },

  async deleteTeacher(id) {
    const teacher = await Teacher.findOneAndDelete({ _id: id, role: 'teacher' });
    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }
    return teacher;
  }
};
