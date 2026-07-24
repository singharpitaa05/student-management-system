export const createCourseSchema = {
  body: {
    type: 'object',
    required: ['name', 'code', 'credits', 'teacher'],
    properties: {
      name: { type: 'string' },
      code: { type: 'string' },
      description: { type: 'string' },
      credits: { type: 'number', minimum: 1 },
      teacher: { type: 'string' }, // ObjectId
    },
  },
};

export const updateCourseSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      credits: { type: 'number', minimum: 1 },
      teacher: { type: 'string' },
      isActive: { type: 'boolean' },
    },
  },
};

export const enrollStudentSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  body: {
    type: 'object',
    required: ['studentId'],
    properties: { studentId: { type: 'string' } },
  },
};
