import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { trackUserInteraction, getAllInteractions } from './service';

export const trackInteraction = asyncHandler(async (req: Request, res: Response) => {
  const { interactionType, metadata, sessionId } = req.body;
  const userId = req.user?.id;
  
  await trackUserInteraction({
    userId,
    sessionId,
    interactionType,
    metadata,
  });

  res.json({
    success: true,
    message: 'Interaction tracked',
  });
});

export const getInteractions = asyncHandler(async (req: Request, res: Response) => {
  const interactions = await getAllInteractions();

  res.json({
    success: true,
    data: interactions,
  });
});
