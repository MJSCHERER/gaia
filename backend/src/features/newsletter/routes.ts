import { Router } from 'express';
import { subscribe, unsubscribe, getSubscribers } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router: Router = Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/subscribers', authenticate, authorize('ADMIN'), getSubscribers);

export default router;
