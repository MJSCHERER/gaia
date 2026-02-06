import { Router } from 'express';
import { getPurchases, getPurchaseById, getDownloadLink } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.get('/:itemId/download', getDownloadLink);

export default router;
