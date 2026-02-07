import { Router } from 'express';
import {
  getAllArtworks,
  getArtworkBySlug,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  incrementViewCount,
} from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router: Router = Router();

router.get('/', getAllArtworks);
router.get('/:slug', getArtworkBySlug);
router.post('/:slug/view', incrementViewCount);
router.post('/', authenticate, authorize('ARTIST', 'ADMIN'), createArtwork);
router.patch('/:id', authenticate, authorize('ARTIST', 'ADMIN'), updateArtwork);
router.delete('/:id', authenticate, authorize('ARTIST', 'ADMIN'), deleteArtwork);

export default router;
