import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Teacher or Admin
      required: true,
    },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused'],
          required: true,
        },
        remarks: {
          type: String,
          default: '',
        },
      },
    ],
  },
  { timestamps: true }
);

// Ensure only one attendance sheet per course per day
attendanceSchema.index({ course: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
