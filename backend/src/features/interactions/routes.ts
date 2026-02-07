import { Router } from 'express';
import { trackInteraction, getInteractions } from './controller.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';

const router: Router = Router();

router.post('/', optionalAuth, trackInteraction);
router.get('/', authenticate, getInteractions);

export default router;
