import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { addSubscriber, removeSubscriber, getAllSubscribers } from './service';

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email, firstName, lastName, language } = req.body;
  
  await addSubscriber({ email, firstName, lastName, language });

  res.json({
    success: true,
    message: 'Successfully subscribed to newsletter',
  });
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  await removeSubscriber(email);

  res.json({
    success: true,
    message: 'Successfully unsubscribed',
  });
});

export const getSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const subscribers = await getAllSubscribers();

  res.json({
    success: true,
    data: subscribers,
  });
});
