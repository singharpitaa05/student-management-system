export const createStudentSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string', minLength: 2 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      rollNumber: { type: 'string' },
      batch: { type: 'string' },
      dob: { type: 'string', format: 'date-time' },
      phone: { type: 'string' },
    },
  },
};

export const updateStudentSchema = {
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
      phone: { type: 'string' },
      address: { type: 'string' },
      guardianName: { type: 'string' },
      guardianPhone: { type: 'string' },
      batch: { type: 'string' },
      feeStatus: { type: 'string', enum: ['paid', 'pending', 'overdue'] },
      password: { type: 'string', minLength: 6 },
      isActive: { type: 'boolean' },
    },
  },
};

export const getStudentSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};

export const listStudentsSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', default: 1 },
      limit: { type: 'integer', default: 10 },
      search: { type: 'string' },
      batch: { type: 'string' },
      feeStatus: { type: 'string', enum: ['paid', 'pending', 'overdue'] },
    },
  },
};
