import { PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

interface ArtworkFilters {
  category?: string;
  artist?: string;
  search?: string;
  page: number;
  limit: number;
}

export const getArtworks = async (filters: ArtworkFilters) => {
  const { category, artist, search, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: any = { isAvailable: true };

  if (category) {
    where.category = category.toUpperCase();
  }

  if (artist) {
    where.artist = { slug: artist };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

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
        artist: {
          select: {
            artistName: true,
            slug: true,
          },
        },
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
          user: {
            select: {
              avatar: true,
            },
          },
        },
      },
      reviews: {
        where: { isApproved: true },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!artwork) {
    throw createError('Artwork not found', 404);
  }

  return artwork;
};

export const createNewArtwork = async (userId: string, data: any) => {
  const artist = await prisma.artistProfile.findUnique({
    where: { userId },
  });

  if (!artist) {
    throw createError('Artist profile not found', 404);
  }

  const artwork = await prisma.artwork.create({
    data: {
      artistId: artist.id,
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      category: data.category,
      thumbnail: data.thumbnail,
      images: data.images || [],
      watermarkedImage: data.watermarkedImage,
      price: data.price,
      currency: data.currency || 'EUR',
      isDigital: data.isDigital || false,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      depthCm: data.depthCm,
      weightKg: data.weightKg,
      descriptionPdf: data.descriptionPdf,
    },
  });

  return artwork;
};

export const updateArtworkById = async (
  artworkId: string,
  userId: string,
  data: any
) => {
  const artist = await prisma.artistProfile.findUnique({
    where: { userId },
  });

  if (!artist) {
    throw createError('Artist profile not found', 404);
  }

  const artwork = await prisma.artwork.findFirst({
    where: {
      id: artworkId,
      artistId: artist.id,
    },
  });

  if (!artwork) {
    throw createError('Artwork not found or unauthorized', 404);
  }

  const updated = await prisma.artwork.update({
    where: { id: artworkId },
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      thumbnail: data.thumbnail,
      images: data.images,
      watermarkedImage: data.watermarkedImage,
      price: data.price,
      isAvailable: data.isAvailable,
      isDigital: data.isDigital,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      depthCm: data.depthCm,
      weightKg: data.weightKg,
      descriptionPdf: data.descriptionPdf,
    },
  });

  return updated;
};

export const deleteArtworkById = async (artworkId: string, userId: string) => {
  const artist = await prisma.artistProfile.findUnique({
    where: { userId },
  });

  if (!artist) {
    throw createError('Artist profile not found', 404);
  }

  const artwork = await prisma.artwork.findFirst({
    where: {
      id: artworkId,
      artistId: artist.id,
    },
  });

  if (!artwork) {
    throw createError('Artwork not found or unauthorized', 404);
  }

  await prisma.artwork.delete({
    where: { id: artworkId },
  });
};

export const incrementViews = async (slug: string) => {
  await prisma.artwork.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });
};
