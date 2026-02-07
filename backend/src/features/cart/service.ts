import { PrismaClient, CartItem } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

// Type for grouped cart by artist
interface GroupedCartItem {
  artist: {
    artistName: string;
    slug: string;
  };
  items: CartItemWithArtwork[];
  subtotal: number;
}

// Type for CartItem with artwork relation (only selected fields)
interface CartItemWithArtwork extends CartItem {
  artwork: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    price: string; // Decimal wird als string geliefert von Prisma
    currency: string;
    isDigital: boolean;
    artist: {
      artistName: string;
      slug: string;
    };
  };
}

export const getUserCart = async (userId: string) => {
  const cartItemsRaw = await prisma.cartItem.findMany({
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

  // Prisma Decimal -> string konvertieren
  const cartItems: CartItemWithArtwork[] = cartItemsRaw.map((item) => ({
    ...item,
    artwork: {
      ...item.artwork,
      price: item.artwork.price.toString(),
    },
  }));

  // Group by artist
  const groupedByArtist: Record<string, GroupedCartItem> = cartItems.reduce(
    (acc, item) => {
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
    },
    {} as Record<string, GroupedCartItem>,
  );

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.artwork.price) * item.quantity,
    0,
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: cartItems,
    groupedByArtist: Object.values(groupedByArtist),
    itemCount,
    total,
  };
};

export const addItemToCart = async (userId: string, artworkId: string, quantity: number = 1) => {
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

export const updateItem = async (userId: string, itemId: string, quantity: number) => {
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
