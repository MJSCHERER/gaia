import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { getGalleryArtworks, getFeatured, getArtistsForPreview } from './service';

export const getGalleryData = asyncHandler(
  async (req: Request, res: Response) => {
    const { artist, category, page = '1', limit = '20', sort = 'newest' } = req.query;
    
    const result = await getGalleryArtworks({
      artist: artist as string,
      category: category as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: sort as string,
    });

    res.json({
      success: true,
      data: result,
    });
  }
);

export const getFeaturedArtworks = asyncHandler(
  async (req: Request, res: Response) => {
    const artworks = await getFeatured();

    res.json({
      success: true,
      data: artworks,
    });
  }
);

export const getArtistsPreview = asyncHandler(
  async (req: Request, res: Response) => {
    const artists = await getArtistsForPreview();

    res.json({
      success: true,
      data: artists,
    });
  }
);
