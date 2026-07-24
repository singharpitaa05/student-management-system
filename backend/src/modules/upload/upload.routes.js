import { uploadController } from './upload.controller.js';

export default async function uploadRoutes(fastify, options) {
  fastify.addHook('preHandler', fastify.authenticate);
  
  fastify.post('/avatar', uploadController.uploadAvatar);
}
