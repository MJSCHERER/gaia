import { Router } from 'express';
import {
  getAllArtists,
  getArtistBySlug,
  getArtistArtworks,
  getArtistExhibitions,
  getArtistPublications,
  createArtistProfile,
  updateArtistProfile,
} from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllArtists);
router.get('/:slug', getArtistBySlug);
router.get('/:slug/artworks', getArtistArtworks);
router.get('/:slug/exhibitions', getArtistExhibitions);
router.get('/:slug/publications', getArtistPublications);

// Protected routes
router.post('/', authenticate, authorize('ARTIST', 'ADMIN'), createArtistProfile);
router.patch('/:id', authenticate, authorize('ARTIST', 'ADMIN'), updateArtistProfile);

export default router;
