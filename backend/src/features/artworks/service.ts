// ./backend/src/features/artworks/service.ts

import { PrismaClient, Prisma, ArtworkCategory } from '@prisma/client';
import { createError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

interface ArtworkFilters {
  category?: string;
  artist?: string;
  search?: string;
  page: number;
  limit: number;
}

// --- Helper: safely convert string to ArtworkCategory ---
// Works with enums where values are strings (Prisma-generated)
const parseCategory = (category?: string): ArtworkCategory => {
  if (!category) {
    throw createError('Category is required', 400);
  }
  const upper = category.toUpperCase();

  // get only string values from enum representation
  const enumValues = Object.values(ArtworkCategory).filter(
    (v) => typeof v === 'string',
  ) as string[];

  if (enumValues.includes(upper)) {
    return upper as ArtworkCategory;
  }

  throw createError(`Invalid category: ${category}`, 400);
};

// --- Get multiple artworks ---
export const getArtworks = async (filters: ArtworkFilters) => {
  const { category, artist, search, page, limit } = filters;
  const skip = Math.max(0, (page - 1) * limit);

  const where: Prisma.ArtworkWhereInput = {
    isAvailable: true,
    ...(category
      ? {
          category: (() => {
            // for queries we allow the caller to pass category optionally;
            // if invalid, ignore the filter (optional: you could throw)
            try {
              return parseCategory(category);
            } catch {
              return undefined;
            }
          })(),
        }
      : {}),
    ...(artist ? { artist: { slug: artist } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        thumbnail: true,
        price: true,
        currency: true,
        isDigital: true,
        widthCm: true,
        heightCm: true,
        viewCount: true,
        wishlistCount: true,
        createdAt: true,
        artist: { select: { artistName: true, slug: true } },
      },
    }),
    prisma.artwork.count({ where }),
  ]);

  return {
    artworks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

// --- Get single artwork ---
export const getArtwork = async (slug: string) => {
  const artwork = await prisma.artwork.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      thumbnail: true,
      images: true,
      watermarkedImage: true,
      price: true,
      currency: true,
      isAvailable: true,
      isDigital: true,
      widthCm: true,
      heightCm: true,
      depthCm: true,
      weightKg: true,
      descriptionPdf: true,
      viewCount: true,
      wishlistCount: true,
      purchaseCount: true,
      createdAt: true,
      artist: {
        select: {
          id: true,
          artistName: true,
          slug: true,
          bio: true,
          user: { select: { avatar: true } },
        },
      },
      reviews: {
        where: { isApproved: true },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!artwork) throw createError('Artwork not found', 404);
  return artwork;
};

// --- Create new artwork ---
interface CreateArtworkData {
  title: string;
  slug?: string;
  description?: string;
  category: string; // required because Prisma schema requires it
  thumbnail: string; // required by schema
  images?: string[];
  watermarkedImage: string; // required by schema
  price: number;
  currency?: string;
  isDigital?: boolean;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  weightKg?: number;
  descriptionPdf?: string;
}

export const createNewArtwork = async (userId: string, data: CreateArtworkData) => {
  const artist = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!artist) throw createError('Artist profile not found', 404);

  // parseCategory will throw if invalid or missing -> matches Prisma requiredness
  const category = parseCategory(data.category);

  // watermarkedImage and thumbnail are required according to your schema;
  // fail early if missing
  if (!data.watermarkedImage) {
    throw createError('watermarkedImage is required', 400);
  }
  if (!data.thumbnail) {
    throw createError('thumbnail is required', 400);
  }

  return await prisma.artwork.create({
    data: {
      artistId: artist.id,
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
      description: data.description ?? undefined,
      category, // ArtworkCategory (guaranteed)
      thumbnail: data.thumbnail,
      images: data.images ?? [],
      watermarkedImage: data.watermarkedImage,
      price: data.price,
      currency: data.currency ?? 'EUR',
      isDigital: data.isDigital ?? false,
      widthCm: data.widthCm ?? undefined,
      heightCm: data.heightCm ?? undefined,
      depthCm: data.depthCm ?? undefined,
      weightKg: data.weightKg ?? undefined,
      descriptionPdf: data.descriptionPdf ?? undefined,
    },
  });
};

// --- Update artwork ---
interface UpdateArtworkData {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  images?: string[];
  watermarkedImage?: string;
  price?: number;
  currency?: string;
  isDigital?: boolean;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  weightKg?: number;
  descriptionPdf?: string;
  isAvailable?: boolean;
}

export const updateArtworkById = async (
  artworkId: string,
  userId: string,
  data: UpdateArtworkData,
) => {
  const artist = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!artist) throw createError('Artist profile not found', 404);

  const artwork = await prisma.artwork.findFirst({
    where: { id: artworkId, artistId: artist.id },
  });
  if (!artwork) throw createError('Artwork not found or unauthorized', 404);

  // category optional on update: only include when provided (and valid)
  let categoryValue: ArtworkCategory | undefined;
  if (data.category !== undefined) {
    categoryValue = parseCategory(data.category); // will throw if invalid
  }

  return await prisma.artwork.update({
    where: { id: artworkId },
    data: {
      title: data.title ?? artwork.title,
      description: data.description ?? artwork.description,
      ...(categoryValue ? { category: categoryValue } : {}),
      thumbnail: data.thumbnail ?? artwork.thumbnail,
      images: data.images ?? artwork.images,
      ...(data.watermarkedImage ? { watermarkedImage: data.watermarkedImage } : {}),
      price: data.price ?? artwork.price,
      isAvailable: data.isAvailable ?? artwork.isAvailable,
      isDigital: data.isDigital ?? artwork.isDigital,
      widthCm: data.widthCm ?? artwork.widthCm,
      heightCm: data.heightCm ?? artwork.heightCm,
      depthCm: data.depthCm ?? artwork.depthCm,
      weightKg: data.weightKg ?? artwork.weightKg,
      descriptionPdf: data.descriptionPdf ?? artwork.descriptionPdf,
    },
  });
};

// --- Delete artwork ---
export const deleteArtworkById = async (artworkId: string, userId: string) => {
  const artist = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!artist) throw createError('Artist profile not found', 404);

  const artwork = await prisma.artwork.findFirst({
    where: { id: artworkId, artistId: artist.id },
  });
  if (!artwork) throw createError('Artwork not found or unauthorized', 404);

  await prisma.artwork.delete({ where: { id: artworkId } });
};

// --- Increment views ---
export const incrementViews = async (slug: string) => {
  await prisma.artwork.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });
};
