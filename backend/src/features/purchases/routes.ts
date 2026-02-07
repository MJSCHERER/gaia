import { Router } from 'express';
import { getPurchases, getPurchaseById, getDownloadLink } from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.get('/:itemId/download', getDownloadLink);

export default router;
