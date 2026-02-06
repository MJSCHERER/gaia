import { PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      avatar: true,
      bio: true,
      emailVerified: true,
      createdAt: true,
      lastLoginAt: true,
      artistProfile: {
        select: {
          id: true,
          artistName: true,
          slug: true,
        },
      },
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

export const updateUserById = async (
  userId: string,
  requestingUserId: string,
  data: any
) => {
  // Check if user is updating their own profile or is admin
  const requestingUser = await prisma.user.findUnique({
    where: { id: requestingUserId },
    select: { role: true },
  });

  if (userId !== requestingUserId && requestingUser?.role !== 'ADMIN') {
    throw createError('Unauthorized', 403);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      avatar: data.avatar,
      ...(requestingUser?.role === 'ADMIN' && {
        role: data.role,
        status: data.status,
      }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      avatar: true,
      bio: true,
    },
  });

  return user;
};

export const deleteUserById = async (userId: string) => {
  await prisma.user.delete({
    where: { id: userId },
  });
};
