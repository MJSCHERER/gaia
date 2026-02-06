import { PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export const getUserCart = async (userId: string) => {
  const cartItems = await prisma.cartItem.findMany({
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
          isDigital: true,
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

  // Group by artist
  const groupedByArtist = cartItems.reduce((acc: any, item: any) => {
    const artistName = item.artwork.artist.artistName;
    if (!acc[artistName]) {
      acc[artistName] = {
        artist: item.artwork.artist,
        items: [],
        subtotal: 0,
      };
    }
    acc[artistName].items.push(item);
    acc[artistName].subtotal += Number(item.artwork.price) * item.quantity;
    return acc;
  }, {});

  const total = cartItems.reduce(
    (sum: number, item: any) => sum + Number(item.artwork.price) * item.quantity,
    0
  );

  return {
    items: cartItems,
    groupedByArtist: Object.values(groupedByArtist),
    itemCount: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
    total,
  };
};

export const addItemToCart = async (
  userId: string,
  artworkId: string,
  quantity: number = 1
) => {
  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
  });

  if (!artwork || !artwork.isAvailable) {
    throw createError('Artwork not available', 400);
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      userId,
      artworkId,
    },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId,
        artworkId,
        quantity,
      },
    });
  }

  return getUserCart(userId);
};

export const updateItem = async (
  userId: string,
  itemId: string,
  quantity: number
) => {
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
  });

  if (!cartItem) {
    throw createError('Cart item not found', 404);
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  return getUserCart(userId);
};

export const removeItem = async (userId: string, itemId: string) => {
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
  });

  if (!cartItem) {
    throw createError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({
    where: { id: itemId },
  });

  return getUserCart(userId);
};

export const clearUserCart = async (userId: string) => {
  await prisma.cartItem.deleteMany({
    where: { userId },
  });
};
