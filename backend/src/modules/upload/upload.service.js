import cloudinary from '../../config/cloudinary.config.js';
import ApiError from '../../utils/apiError.js';
import { User } from '../../models/user.model.js';
import { envConfig } from '../../config/env.config.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'uploads', 'avatars');

// Ensure the uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    // Directory already exists, that's fine
  }
}

export const uploadService = {
  async uploadAvatar(file, userId) {
    if (!file) {
      throw new ApiError(400, 'No file provided');
    }

    const fileBuffer = await file.toBuffer();
    const mimeType = file.mimetype;

    // Validate image type
    if (!mimeType.startsWith('image/')) {
      throw new ApiError(400, 'Only image files are allowed');
    }

    let avatarUrl;

    // Try Cloudinary first, fall back to local storage
    try {
      const base64String = fileBuffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64String}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'student_management_avatars',
        width: 150,
        height: 150,
        crop: 'fill',
        resource_type: 'image',
      });
      avatarUrl = result.secure_url;
    } catch (cloudinaryError) {
      // Cloudinary failed — fall back to local file storage
      console.warn('Cloudinary upload failed, using local storage:', cloudinaryError.message);

      await ensureUploadsDir();

      const ext = mimeType.split('/')[1] || 'png';
      const filename = `${userId}_${crypto.randomBytes(8).toString('hex')}.${ext}`;
      const filepath = path.join(UPLOADS_DIR, filename);

      await fs.writeFile(filepath, fileBuffer);

      // Serve from the backend's static route
      avatarUrl = `http://localhost:${envConfig.port}/uploads/avatars/${filename}`;
    }

    // Update user's avatar URL
    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return { avatarUrl };
  }
};
