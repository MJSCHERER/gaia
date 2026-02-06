import { Router } from 'express';
import { subscribe, unsubscribe, getSubscribers } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/subscribers', authenticate, authorize('ADMIN'), getSubscribers);

export default router;
