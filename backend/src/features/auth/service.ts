import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { createError } from '../../middleware/errorHandler.js';
import { sendEmail } from '../../services/email.js';
// import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '15m';

const JWT_REFRESH_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

interface TokenUser {
  id: string;
  email: string;
  role: 'GUEST' | 'COLLECTOR' | 'ARTIST' | 'ADMIN';
}

// Generate tokens
export const generateTokens = (user: TokenUser) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      tokenId: uuidv4(),
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN },
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
};

// Register user
export const registerUser = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  const { email, password, firstName, lastName } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError('Email already registered', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'COLLECTOR',
      status: 'PENDING',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  // Generate verification token
  const verificationToken = uuidv4();
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  // Send verification email
  await sendEmail({
    to: email,
    subject: 'Verify your email - Gaiamundi',
    template: 'email-verification',
    data: {
      firstName,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
    },
  });

  return { user };
};

// Login user
export const loginUser = async (email: string, password: string, rememberMe: boolean = false) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    throw createError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw createError('Please verify your email before logging in', 401);
  }

  // Check account status
  if (user.status !== 'ACTIVE') {
    throw createError('Account is not active', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const tokens = generateTokens(user);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    },
    ...tokens,
  };
};

// Logout user
export const logoutUser = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

// Refresh access token
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string;
      tokenId: string;
    };

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw createError('Invalid refresh token', 401);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw createError('User not found or inactive', 401);
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    // Generate new tokens
    const tokens = generateTokens(user);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid refresh token', 401);
    }
    throw error;
  }
};

// Verify email token
export const verifyEmailToken = async (token: string) => {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    throw createError('Invalid or expired verification token', 400);
  }

  // Update user
  await prisma.user.update({
    where: { email: verificationToken.email },
    data: {
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  // Delete verification token
  await prisma.emailVerificationToken.delete({
    where: { token },
  });
};

// Resend verification email
export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.emailVerified) {
    // Don't reveal if user exists
    return;
  }

  // Delete old tokens
  await prisma.emailVerificationToken.deleteMany({
    where: { email },
  });

  // Generate new token
  const verificationToken = uuidv4();
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Send email
  await sendEmail({
    to: email,
    subject: 'Verify your email - Gaiamundi',
    template: 'email-verification',
    data: {
      firstName: user.firstName,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
    },
  });
};

// Request password reset
export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists
    return;
  }

  // Delete old tokens
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  // Generate new token
  const resetToken = uuidv4();
  await prisma.passwordResetToken.create({
    data: {
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    },
  });

  // Send email
  await sendEmail({
    to: email,
    subject: 'Reset your password - Gaiamundi',
    template: 'password-reset',
    data: {
      firstName: user.firstName,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
    },
  });
};

// Reset password with token
export const resetPasswordWithToken = async (token: string, newPassword: string) => {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw createError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update user
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword },
  });

  // Delete reset token
  await prisma.passwordResetToken.delete({
    where: { token },
  });

  // Delete all refresh tokens for security
  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });

  if (user) {
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });
  }
};

// Change user password
export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.password) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Delete all refresh tokens for security
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

// Get user by ID
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      bio: true,
      emailVerified: true,
      createdAt: true,
      artistProfile: {
        select: {
          id: true,
          artistName: true,
          slug: true,
          bio: true,
        },
      },
      addresses: true,
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
  },
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      bio: true,
    },
  });

  return user;
};
