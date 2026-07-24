import mongoose from 'mongoose';
import { User } from './user.model.js';

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  batch: {
    type: String,
    default: '',
  },
  admissionDate: {
    type: Date,
  },
  dob: {
    type: Date,
  },
  address: {
    type: String,
    default: '',
  },
  guardianName: {
    type: String,
    default: '',
  },
  guardianPhone: {
    type: String,
    default: '',
  },
  feeStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending',
  },
});

export const Student = User.discriminator('student', studentSchema);
