import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { createIntent, confirmPaymentIntent, handleWebhook } from './service.js';

export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { items, shippingAddress } = req.body;

  const result = await createIntent(userId, items, shippingAddress);

  res.json({
    success: true,
    data: result,
  });
});

export const confirmPayment = asyncHandler(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.body;

  const result = await confirmPaymentIntent(paymentIntentId);

  res.json({
    success: true,
    data: result,
  });
});

export const getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      methods: ['stripe', 'paypal'],
    },
  });
});

export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  await handleWebhook(req.body, signature);

  res.json({ received: true });
});
