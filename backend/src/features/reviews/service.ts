import { PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export const getArtworkReviews = async (artworkId: string) => {
  const reviews = await prisma.review.findMany({
    where: {
      artworkId,
      isApproved: true,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return reviews;
};

export const createNewReview = async (
  userId: string,
  artworkId: string,
  rating: number,
  comment?: string
) => {
  // Check if user has purchased this artwork
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      items: {
        some: {
          artworkId,
        },
      },
    },
  });

  if (!purchase) {
    throw createError('You must purchase this artwork to review it', 403);
  }

  // Check if user already reviewed
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      artworkId,
    },
  });

  if (existingReview) {
    throw createError('You have already reviewed this artwork', 409);
  }

  const review = await prisma.review.create({
    data: {
      userId,
      artworkId,
      rating,
      comment,
      isApproved: false, // Requires moderation
    },
  });

  return review;
};

export const approveReviewById = async (reviewId: string) => {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: true },
  });

  return review;
};

export const deleteReviewById = async (reviewId: string) => {
  await prisma.review.delete({
    where: { id: reviewId },
  });
};
