import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { getUserWishlist, addItem, removeItem } from './service';

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const wishlist = await getUserWishlist(userId);

  res.json({
    success: true,
    data: wishlist,
  });
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { artworkId } = req.body;

  await addItem(userId, artworkId);

  res.status(201).json({
    success: true,
    message: 'Added to wishlist',
  });
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { artworkId } = req.params;

  await removeItem(userId, artworkId);

  res.json({
    success: true,
    message: 'Removed from wishlist',
  });
});
