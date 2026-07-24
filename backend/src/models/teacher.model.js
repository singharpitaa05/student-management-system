import mongoose from 'mongoose';
import { User } from './user.model.js';

const teacherSchema = new mongoose.Schema({
  subjects: [
    {
      type: String,
    },
  ],
  assignedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
});

export const Teacher = User.discriminator('teacher', teacherSchema);
