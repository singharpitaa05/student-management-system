import bcrypt from 'bcrypt';
import { Student } from '../../models/student.model.js';
import { User } from '../../models/user.model.js';
import ApiError from '../../utils/apiError.js';

export const studentService = {
  async createStudent(data) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const studentData = {
      ...data,
      role: 'student',
    };

    const student = await Student.create(studentData);

    return {
      _id: student._id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      batch: student.batch,
    };
  },

  async getAllStudents(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { role: 'student' };
    
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { rollNumber: { $regex: query.search, $options: 'i' } }
      ];
    }
    if (query.batch) {
      filter.batch = query.batch;
    }
    if (query.feeStatus) {
      filter.feeStatus = query.feeStatus;
    }

    const students = await Student.find(filter)
      .select('-password -refreshTokenHash')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filter);

    return {
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  },

  async getStudentById(id) {
    const student = await Student.findById(id).select('-password -refreshTokenHash');
    if (!student || student.role !== 'student') {
      throw new ApiError(404, 'Student not found');
    }
    return student;
  },

  async updateStudent(id, updateData) {
    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const student = await Student.findOneAndUpdate(
      { _id: id, role: 'student' },
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokenHash');

    if (!student) {
      throw new ApiError(404, 'Student not found');
    }
    return student;
  },

  async deleteStudent(id) {
    const student = await Student.findOneAndDelete({ _id: id, role: 'student' });
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }
    return student;
  }
};
