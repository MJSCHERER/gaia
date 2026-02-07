import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { getUserCart, addItemToCart, updateItem, removeItem, clearUserCart } from './service';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const cart = await getUserCart(userId);

  res.json({
    success: true,
    data: cart,
  });
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { artworkId, quantity } = req.body;

  const cart = await addItemToCart(userId, artworkId, quantity);

  res.status(201).json({
    success: true,
    message: 'Item added to cart',
    data: cart,
  });
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await updateItem(userId, itemId, quantity);

  res.json({
    success: true,
    message: 'Cart updated',
    data: cart,
  });
});

export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.params;

  const cart = await removeItem(userId, itemId);

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: cart,
  });
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await clearUserCart(userId);

  res.json({
    success: true,
    message: 'Cart cleared',
  });
});
