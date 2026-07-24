import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config.js';
import ApiError from '../utils/apiError.js';

export default fp(async (fastify) => {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Unauthorized, token missing');
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, envConfig.jwt.accessSecret);
      request.user = decoded; // { userId, role }
    } catch (err) {
      throw new ApiError(401, 'Unauthorized, invalid token');
    }
  });
});
