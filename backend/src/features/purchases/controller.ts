import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { getUserPurchases, getPurchase, generateDownloadLink } from './service';

export const getPurchases = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const purchases = await getUserPurchases(userId);

  res.json({
    success: true,
    data: purchases,
  });
});

export const getPurchaseById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  
  const purchase = await getPurchase(userId, id);

  res.json({
    success: true,
    data: purchase,
  });
});

export const getDownloadLink = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.params;
  
  const download = await generateDownloadLink(userId, itemId);

  res.json({
    success: true,
    data: download,
  });
});
