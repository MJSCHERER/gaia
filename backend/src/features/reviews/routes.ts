import { Router } from 'express';
import { getReviews, createReview, approveReview, deleteReview } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router: Router = Router();

router.get('/artwork/:artworkId', getReviews);
router.post('/', authenticate, createReview);
router.patch('/:id/approve', authenticate, authorize('ADMIN'), approveReview);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteReview);

export default router;
