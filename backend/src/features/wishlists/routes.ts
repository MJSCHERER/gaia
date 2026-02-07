import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:artworkId', removeFromWishlist);

export default router;
