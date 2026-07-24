export const dashboardSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          additionalProperties: true, // Allow flexible structure based on role
        },
      },
    },
  },
};
