import { uploadService } from './upload.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const uploadController = {
  async uploadAvatar(request, reply) {
    const data = await request.file();
    const result = await uploadService.uploadAvatar(data, request.user.userId);
    
    reply.send(new ApiResponse(200, result, 'Avatar uploaded successfully'));
  }
};
