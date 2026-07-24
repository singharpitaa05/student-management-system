import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { envConfig } from '../config/env.config.js';

export default fp(async (fastify) => {
  fastify.register(cors, {
    origin: envConfig.frontendUrl,
    credentials: true,
  });
});
