export const markAttendanceSchema = {
  body: {
    type: 'object',
    required: ['courseId', 'date', 'records'],
    properties: {
      courseId: { type: 'string' },
      date: { type: 'string', format: 'date' },
      records: {
        type: 'array',
        items: {
          type: 'object',
          required: ['student', 'status'],
          properties: {
            student: { type: 'string' },
            status: { type: 'string', enum: ['present', 'absent', 'late', 'excused'] },
            remarks: { type: 'string' },
          },
        },
      },
    },
  },
};

export const getAttendanceSchema = {
  querystring: {
    type: 'object',
    required: ['courseId'],
    properties: {
      courseId: { type: 'string' },
      date: { type: 'string', format: 'date' },
    },
  },
};

export const getStudentAttendanceSchema = {
  params: {
    type: 'object',
    required: ['studentId'],
    properties: {
      studentId: { type: 'string' },
    },
  },
};
