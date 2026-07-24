import { authService } from './auth.service.js';
import ApiResponse from '../../utils/apiResponse.js';
import { envConfig } from '../../config/env.config.js';

const setRefreshCookie = (reply, token) => {
  reply.setCookie('refreshToken', token, {
    path: '/',
    httpOnly: true,
    secure: envConfig.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
};

export const authController = {
  async signup(request, reply) {
    const { user, accessToken, refreshToken } = await authService.signup(request.body);
    
    setRefreshCookie(reply, refreshToken);
    
    const response = new ApiResponse(201, { user, accessToken }, 'User registered successfully');
    reply.status(201).send(response);
  },

  async login(request, reply) {
    const { email, password } = request.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    setRefreshCookie(reply, refreshToken);

    const response = new ApiResponse(200, { user, accessToken }, 'Login successful');
    reply.send(response);
  },

  async googleLogin(request, reply) {
    const { idToken } = request.body;
    const result = await authService.googleLogin(idToken);

    if (result.isNewUser) {
      const response = new ApiResponse(200, { isNewUser: true, tempToken: result.tempToken }, 'Choose a role to complete signup');
      return reply.send(response);
    }

    setRefreshCookie(reply, result.refreshToken);

    const response = new ApiResponse(200, { isNewUser: false, user: result.user, accessToken: result.accessToken }, 'Google login successful');
    reply.send(response);
  },

  async completeGoogleSignup(request, reply) {
    const { tempToken, role } = request.body;
    const { user, accessToken, refreshToken } = await authService.completeGoogleSignup(tempToken, role);

    setRefreshCookie(reply, refreshToken);

    const response = new ApiResponse(201, { user, accessToken }, 'Google signup completed successfully');
    reply.status(201).send(response);
  },

  async refresh(request, reply) {
    const token = request.cookies.refreshToken;
    const { accessToken, refreshToken } = await authService.refreshToken(token);

    setRefreshCookie(reply, refreshToken);

    const response = new ApiResponse(200, { accessToken }, 'Token refreshed');
    reply.send(response);
  },

  async logout(request, reply) {
    // Assuming the user is authenticated to logout, or we just try with the refresh token if not authenticated
    // If authenticated, we use request.user.userId
    // If not, we might need to decode the refresh token to get the ID, but for simplicity, let's require authentication for logout
    if (request.user) {
      await authService.logout(request.user.userId);
    }
    
    reply.clearCookie('refreshToken', { path: '/' });
    
    const response = new ApiResponse(200, null, 'Logged out successfully');
    reply.send(response);
  },

  async forgotPassword(request, reply) {
    await authService.forgotPassword(request.body.email);
    const response = new ApiResponse(200, null, 'If that email exists, a reset link has been sent');
    reply.send(response);
  },

  async resetPassword(request, reply) {
    const { token, newPassword } = request.body;
    await authService.resetPassword(token, newPassword);
    
    const response = new ApiResponse(200, null, 'Password reset successfully');
    reply.send(response);
  },
};

