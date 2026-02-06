import { PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export const getUserPurchases = async (userId: string) => {
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          artwork: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
              isDigital: true,
              artist: {
                select: {
                  artistName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return purchases;
};

export const getPurchase = async (userId: string, purchaseId: string) => {
  const purchase = await prisma.purchase.findFirst({
    where: {
      id: purchaseId,
      userId,
    },
    include: {
      items: {
        include: {
          artwork: {
            include: {
              artist: true,
            },
          },
        },
      },
    },
  });

  if (!purchase) {
    throw createError('Purchase not found', 404);
  }

  return purchase;
};

export const generateDownloadLink = async (userId: string, itemId: string) => {
  const purchaseItem = await prisma.purchaseItem.findFirst({
    where: {
      id: itemId,
      purchase: {
        userId,
      },
      artwork: {
        isDigital: true,
      },
    },
    include: {
      artwork: true,
      purchase: true,
    },
  });

  if (!purchaseItem) {
    throw createError('Download not available', 404);
  }

  // Check if download has expired
  if (purchaseItem.purchase.downloadExpiry && purchaseItem.purchase.downloadExpiry < new Date()) {
    throw createError('Download link has expired', 410);
  }

  // Generate signed URL (simplified - would use cloud storage in production)
  const downloadUrl = `${process.env.FRONTEND_URL}/api/downloads/${itemId}?token=signed-token`;

  // Increment download count
  await prisma.purchaseItem.update({
    where: { id: itemId },
    data: { downloadCount: { increment: 1 } },
  });

  return {
    url: downloadUrl,
    filename: `${purchaseItem.artwork.title}.zip`,
    expiresAt: purchaseItem.purchase.downloadExpiry,
  };
};
