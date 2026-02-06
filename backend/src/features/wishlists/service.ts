import { PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export const getUserWishlist = async (userId: string) => {
  const wishlist = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      artwork: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          price: true,
          currency: true,
          isAvailable: true,
          artist: {
            select: {
              artistName: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return wishlist;
};

export const addItem = async (userId: string, artworkId: string) => {
  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
  });

  if (!artwork) {
    throw createError('Artwork not found', 404);
  }

  try {
    await prisma.wishlist.create({
      data: {
        userId,
        artworkId,
      },
    });

    // Increment wishlist count
    await prisma.artwork.update({
      where: { id: artworkId },
      data: { wishlistCount: { increment: 1 } },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError('Already in wishlist', 409);
    }
    throw error;
  }
};

export const removeItem = async (userId: string, artworkId: string) => {
  await prisma.wishlist.deleteMany({
    where: {
      userId,
      artworkId,
    },
  });

  // Decrement wishlist count
  await prisma.artwork.update({
    where: { id: artworkId },
    data: { wishlistCount: { decrement: 1 } },
  });
};
