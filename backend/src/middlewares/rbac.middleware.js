import ApiError from '../utils/apiError.js';

export const authorize = (...allowedRoles) => {
  return async (request, reply) => {
    if (!request.user || !request.user.role) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ApiError(403, 'Forbidden, you do not have permission');
    }
  };
};
