import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../../models/user.model.js';
import { Student } from '../../models/student.model.js';
import { Teacher } from '../../models/teacher.model.js';
import { envConfig } from '../../config/env.config.js';
import ApiError from '../../utils/apiError.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../emails/mailer.service.js';

const googleClient = new OAuth2Client(envConfig.google.clientId);

const generateTokens = (user) => {
  const payload = { userId: user._id, role: user.role };
  
  const accessToken = jwt.sign(payload, envConfig.jwt.accessSecret, {
    expiresIn: envConfig.jwt.accessExpiresIn,
  });
  
  const refreshToken = jwt.sign(payload, envConfig.jwt.refreshSecret, {
    expiresIn: envConfig.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

export const authService = {
  async signup(data) {
    // Check if user exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Force role to student
    const studentData = {
      ...data,
      role: 'student',
    };

    const student = await Student.create(studentData);

    const { accessToken, refreshToken } = generateTokens(student);
    
    // Hash refresh token to store in DB
    const salt = await bcrypt.genSalt(10);
    student.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    await student.save();

    // Send welcome email asynchronously
    sendWelcomeEmail(student.email, student.name).catch(console.error);

    return {
      user: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
      },
      accessToken,
      refreshToken,
    };
  },

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password +refreshTokenHash');
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid credentials or inactive account');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const salt = await bcrypt.genSalt(10);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    await user.save();

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  },

  async googleLogin(idToken) {
    // 1. Verify the Google ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: envConfig.google.clientId,
      });
    } catch (err) {
      throw new ApiError(401, 'Invalid Google token');
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      throw new ApiError(400, 'Google account does not have an email');
    }

    // 2. Find existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    }).select('+refreshTokenHash');

    if (user) {
      // 3a. Existing user — link Google account if not already linked
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        updated = true;
      }
      if (picture && !user.avatarUrl) {
        user.avatarUrl = picture;
        updated = true;
      }
      if (!user.isActive) {
        throw new ApiError(401, 'Account is deactivated');
      }

      // Generate JWT tokens (same as regular login)
      const { accessToken, refreshToken } = generateTokens(user);

      const salt = await bcrypt.genSalt(10);
      user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
      await user.save();

      return {
        isNewUser: false,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        accessToken,
        refreshToken,
      };
    } else {
      // 3b. New user — generate a temporary token containing verified info for role selection
      const tempToken = jwt.sign(
        { email, name, picture, googleId },
        envConfig.jwt.accessSecret,
        { expiresIn: '5m' } // Short-lived token
      );

      return {
        isNewUser: true,
        tempToken,
      };
    }
  },

  async completeGoogleSignup(tempToken, role) {
    if (!['student', 'teacher'].includes(role)) {
      throw new ApiError(400, 'Invalid role selected');
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, envConfig.jwt.accessSecret);
    } catch (err) {
      throw new ApiError(400, 'Invalid or expired temporary registration token');
    }

    const { email, name, picture, googleId } = decoded;

    // Double check if user exists
    let existingUser = await User.findOne({
      $or: [{ googleId }, { email }],
    });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const randomPassword = crypto.randomBytes(32).toString('hex');
    let user;

    if (role === 'student') {
      user = await Student.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        role: 'student',
        googleId,
        authProvider: 'google',
        avatarUrl: picture || '',
        isEmailVerified: true,
      });
    } else if (role === 'teacher') {
      user = await Teacher.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        role: 'teacher',
        googleId,
        authProvider: 'google',
        avatarUrl: picture || '',
        isEmailVerified: true,
      });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user);

    const salt = await bcrypt.genSalt(10);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    await user.save();

    // Send welcome email asynchronously
    sendWelcomeEmail(user.email, user.name).catch(console.error);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(token) {
    if (!token) {
      throw new ApiError(401, 'Refresh token not provided');
    }

    try {
      const decoded = jwt.verify(token, envConfig.jwt.refreshSecret);
      const user = await User.findById(decoded.userId).select('+refreshTokenHash');
      
      if (!user || !user.isActive || !user.refreshTokenHash) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(token, user.refreshTokenHash);
      if (!isMatch) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const tokens = generateTokens(user);
      
      const salt = await bcrypt.genSalt(10);
      user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);
      await user.save();

      return tokens;
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  },

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  },

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return; // Do not reveal if user exists

    // Generate a simple token for demonstration (in production use a short-lived signed token or random crypto token stored in DB)
    const resetToken = jwt.sign({ userId: user._id }, envConfig.jwt.accessSecret, { expiresIn: '15m' });
    const resetLink = `${envConfig.frontendUrl}/reset-password?token=${resetToken}`;
    
    await sendPasswordResetEmail(user.email, resetLink).catch(console.error);
  },

  async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, envConfig.jwt.accessSecret);
      const user = await User.findById(decoded.userId);
      if (!user) throw new ApiError(404, 'User not found');

      user.password = newPassword; // Will be hashed by pre-save hook
      user.refreshTokenHash = null; // Logout from all devices
      await user.save();
    } catch (err) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }
  }
};

