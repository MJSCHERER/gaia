import { Router } from 'express';
import { trackInteraction, getInteractions } from './controller';
import { authenticate, optionalAuth } from '../../middleware/auth';

const router: Router = Router();

router.post('/', optionalAuth, trackInteraction);
router.get('/', authenticate, getInteractions);

export default router;
