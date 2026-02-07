import { Router } from 'express';
import { getGalleryData, getFeaturedArtworks, getArtistsPreview } from './controller';

const router: Router = Router();

router.get('/', getGalleryData);
router.get('/featured', getFeaturedArtworks);
router.get('/artists-preview', getArtistsPreview);

export default router;
