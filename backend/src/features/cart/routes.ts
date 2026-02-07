import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

export default router;
