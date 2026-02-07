import { Router } from 'express';
import { createPaymentIntent, confirmPayment, webhook, getPaymentMethods } from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router: Router = Router();

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/confirm', authenticate, confirmPayment);
router.get('/methods', authenticate, getPaymentMethods);
router.post('/webhook', webhook);

export default router;
