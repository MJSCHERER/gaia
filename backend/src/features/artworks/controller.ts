import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  getArtworks,
  getArtwork,
  createNewArtwork,
  updateArtworkById,
  deleteArtworkById,
  incrementViews,
} from './service';

export const getAllArtworks = asyncHandler(
  async (req: Request, res: Response) => {
    const { category, artist, search, page = '1', limit = '20' } = req.query;
    
    const result = await getArtworks({
      category: category as string,
      artist: artist as string,
      search: search as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: result,
    });
  }
);

export const getArtworkBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const artwork = await getArtwork(slug);

    res.json({
      success: true,
      data: artwork,
    });
  }
);

export const createArtwork = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const artwork = await createNewArtwork(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Artwork created successfully',
      data: artwork,
    });
  }
);

export const updateArtwork = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const artwork = await updateArtworkById(id, userId, req.body);

    res.json({
      success: true,
      message: 'Artwork updated successfully',
      data: artwork,
    });
  }
);

export const deleteArtwork = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    await deleteArtworkById(id, userId);

    res.json({
      success: true,
      message: 'Artwork deleted successfully',
    });
  }
);

export const incrementViewCount = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    await incrementViews(slug);

    res.json({
      success: true,
    });
  }
);
