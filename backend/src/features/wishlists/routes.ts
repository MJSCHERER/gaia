import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from './controller';
import { authenticate } from '../../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:artworkId', removeFromWishlist);

export default router;
