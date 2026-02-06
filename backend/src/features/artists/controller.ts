import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  getArtists,
  getArtist,
  getArtistWorks,
  getExhibitions,
  getPublications,
  createArtist,
  updateArtist,
} from './service';

export const getAllArtists = asyncHandler(
  async (req: Request, res: Response) => {
    const artists = await getArtists();

    res.json({
      success: true,
      data: artists,
    });
  }
);

export const getArtistBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const artist = await getArtist(slug);

    res.json({
      success: true,
      data: artist,
    });
  }
);

export const getArtistArtworks = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { page = '1', limit = '20' } = req.query;
    
    const artworks = await getArtistWorks(slug, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: artworks,
    });
  }
);

export const getArtistExhibitions = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const exhibitions = await getExhibitions(slug);

    res.json({
      success: true,
      data: exhibitions,
    });
  }
);

export const getArtistPublications = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const publications = await getPublications(slug);

    res.json({
      success: true,
      data: publications,
    });
  }
);

export const createArtistProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const artist = await createArtist(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Artist profile created successfully',
      data: artist,
    });
  }
);

export const updateArtistProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const artist = await updateArtist(id, userId, req.body);

    res.json({
      success: true,
      message: 'Artist profile updated successfully',
      data: artist,
    });
  }
);
