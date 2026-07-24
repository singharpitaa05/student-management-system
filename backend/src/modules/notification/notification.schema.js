export const getNotificationsSchema = {
  querystring: {
    type: 'object',
    properties: {
      unreadOnly: { type: 'string', enum: ['true', 'false'] },
      limit: { type: 'number', default: 20 },
    },
  },
};

export const markAsReadSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};

export const sendNotificationSchema = {
  body: {
    type: 'object',
    required: ['title', 'message', 'type'],
    properties: {
      recipients: { type: 'array', items: { type: 'string' } }, // Optional: If empty, could mean broadcast (handled in service)
      role: { type: 'string', enum: ['all', 'student', 'teacher'] }, // Broadcast to role
      title: { type: 'string' },
      message: { type: 'string' },
      type: { type: 'string', enum: ['system', 'enrollment', 'payment', 'attendance', 'general', 'holiday', 'offer'] },
      actionUrl: { type: 'string' },
    },
  },
};
