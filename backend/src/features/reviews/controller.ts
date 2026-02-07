import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { getArtworkReviews, createNewReview, approveReviewById, deleteReviewById } from './service';

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const { artworkId } = req.params;
  const reviews = await getArtworkReviews(artworkId);

  res.json({
    success: true,
    data: reviews,
  });
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { artworkId, rating, comment } = req.body;

  const review = await createNewReview(userId, artworkId, rating, comment);

  res.status(201).json({
    success: true,
    message: 'Review submitted and pending approval',
    data: review,
  });
});

export const approveReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await approveReviewById(id);

  res.json({
    success: true,
    message: 'Review approved',
    data: review,
  });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await deleteReviewById(id);

  res.json({
    success: true,
    message: 'Review deleted',
  });
});
