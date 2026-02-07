import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmailToken,
  resendVerificationEmail,
  requestPasswordReset,
  resetPasswordWithToken,
  changeUserPassword,
  getUserById,
  updateUserProfile,
  generateTokens,
} from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

export type UserRole = 'GUEST' | 'COLLECTOR' | 'ARTIST' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

// Register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  const result = await registerUser({
    email,
    password,
    firstName,
    lastName,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: result,
  });
});

// Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  const result = await loginUser(email, password, rememberMe);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    },
  });
});

// Logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required',
    });
  }

  const result = await refreshAccessToken(refreshToken);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    },
  });
});

// Verify email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  await verifyEmailToken(token);

  res.json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
  });
});

// Resend verification email
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await resendVerificationEmail(email);

  res.json({
    success: true,
    message: 'If an account exists with this email, a verification link has been sent.',
  });
});

// Forgot password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await requestPasswordReset(email);

  res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been sent.',
  });
});

// Reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  await resetPasswordWithToken(token, password);

  res.json({
    success: true,
    message: 'Password reset successful. You can now log in with your new password.',
  });
});

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  await changeUserPassword(userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// Get current user
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await getUserById(userId);

  res.json({
    success: true,
    data: user,
  });
});

// Update profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const updateData = req.body;

  const user = await updateUserProfile(userId, updateData);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

// Google OAuth callback
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;

  const tokens = generateTokens(user);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const redirectUrl = new URL(
    '/auth/callback',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  );
  redirectUrl.searchParams.set('accessToken', tokens.accessToken);
  redirectUrl.searchParams.set('expiresIn', tokens.expiresIn.toString());

  res.redirect(redirectUrl.toString());
});

// Facebook OAuth callback
export const facebookCallback = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;

  const tokens = generateTokens(user);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const redirectUrl = new URL(
    '/auth/callback',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  );
  redirectUrl.searchParams.set('accessToken', tokens.accessToken);
  redirectUrl.searchParams.set('expiresIn', tokens.expiresIn.toString());

  res.redirect(redirectUrl.toString());
});
