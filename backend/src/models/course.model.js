import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Teacher discriminator
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Student discriminator
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);
