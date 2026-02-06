import { Router } from 'express';
import { getReviews, createReview, approveReview, deleteReview } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/artwork/:artworkId', getReviews);
router.post('/', authenticate, createReview);
router.patch('/:id/approve', authenticate, authorize('ADMIN'), approveReview);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteReview);

export default router;
