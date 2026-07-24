import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['system', 'enrollment', 'payment', 'attendance', 'general', 'holiday', 'offer'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String, // Optional URL to redirect to when clicked
    }
  },
  { timestamps: true }
);

// Index for fetching a user's unread notifications quickly
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
