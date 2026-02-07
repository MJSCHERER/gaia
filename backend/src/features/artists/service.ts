import { Prisma, PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

// --- Input DTOs (typed, no any) ---
export interface CreateArtistData {
  artistName: string;
  slug?: string;
  bio: string;
  statement?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

export interface UpdateArtistData extends Partial<CreateArtistData> {
  cvPdf?: string;
  portfolioPdf?: string;
}

// --- Get all artists ---
export const getArtists = async () => {
  return await prisma.artistProfile.findMany({
    select: {
      id: true,
      artistName: true,
      slug: true,
      bio: true,
      statement: true,
      website: true,
      instagram: true,
      facebook: true,
      twitter: true,
      youtube: true,
      user: { select: { avatar: true } },
      _count: { select: { artworks: true } },
    },
  });
};

// --- Get single artist by slug ---
export const getArtist = async (slug: string) => {
  const artist = await prisma.artistProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      artistName: true,
      slug: true,
      bio: true,
      statement: true,
      website: true,
      instagram: true,
      facebook: true,
      twitter: true,
      youtube: true,
      cvPdf: true,
      portfolioPdf: true,
      totalSales: true,
      totalRevenue: true,
      user: { select: { avatar: true, firstName: true, lastName: true } },
      _count: { select: { artworks: true, exhibitions: true, publications: true } },
    },
  });

  if (!artist) throw createError('Artist not found', 404);
  return artist;
};

// --- Get artist artworks with pagination ---
export const getArtistWorks = async (slug: string, options: { page: number; limit: number }) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const artist = await prisma.artistProfile.findUnique({ where: { slug }, select: { id: true } });
  if (!artist) throw createError('Artist not found', 404);

  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where: { artistId: artist.id, isAvailable: true },
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
      },
    }),
    prisma.artwork.count({ where: { artistId: artist.id, isAvailable: true } }),
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

// --- Get exhibitions for artist ---
export const getExhibitions = async (slug: string) => {
  const artist = await prisma.artistProfile.findUnique({ where: { slug }, select: { id: true } });
  if (!artist) throw createError('Artist not found', 404);

  return await prisma.exhibition.findMany({
    where: { artistId: artist.id },
    orderBy: { startDate: 'desc' },
    select: {
      id: true,
      title: true,
      venue: true,
      location: true,
      startDate: true,
      endDate: true,
      description: true,
      link: true,
      isSolo: true,
    },
  });
};

// --- Get publications for artist ---
export const getPublications = async (slug: string) => {
  const artist = await prisma.artistProfile.findUnique({ where: { slug }, select: { id: true } });
  if (!artist) throw createError('Artist not found', 404);

  return await prisma.publication.findMany({
    where: { artistId: artist.id },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      title: true,
      publisher: true,
      date: true,
      link: true,
      description: true,
    },
  });
};

// --- Create artist (typed input) ---
export const createArtist = async (userId: string, data: CreateArtistData) => {
  const existingProfile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (existingProfile) throw createError('Artist profile already exists', 409);

  // Update user role to ARTIST
  await prisma.user.update({ where: { id: userId }, data: { role: 'ARTIST' } });

  // Build Prisma-compatible payload
  const payload: Prisma.ArtistProfileCreateInput = {
    user: { connect: { id: userId } },
    artistName: data.artistName,
    slug: data.slug ?? data.artistName.toLowerCase().replace(/\s+/g, '-'),
    bio: data.bio, // immer vorhanden
    statement: data.statement,
    website: data.website,
    instagram: data.instagram,
    facebook: data.facebook,
    twitter: data.twitter,
    youtube: data.youtube,
  };

  return await prisma.artistProfile.create({ data: payload });
};

// --- Update artist (typed input) ---
export const updateArtist = async (artistId: string, userId: string, data: UpdateArtistData) => {
  const artist = await prisma.artistProfile.findFirst({ where: { id: artistId, userId } });
  if (!artist) throw createError('Artist profile not found or unauthorized', 404);

  // Only set fields that are provided (avoid setting undefined explicitly)
  const updatePayload: Record<string, unknown> = {};
  if (data.artistName !== undefined) updatePayload.artistName = data.artistName;
  if (data.slug !== undefined) updatePayload.slug = data.slug;
  if (data.bio !== undefined) updatePayload.bio = data.bio;
  if (data.statement !== undefined) updatePayload.statement = data.statement;
  if (data.website !== undefined) updatePayload.website = data.website;
  if (data.instagram !== undefined) updatePayload.instagram = data.instagram;
  if (data.facebook !== undefined) updatePayload.facebook = data.facebook;
  if (data.twitter !== undefined) updatePayload.twitter = data.twitter;
  if (data.youtube !== undefined) updatePayload.youtube = data.youtube;
  if (data.cvPdf !== undefined) updatePayload.cvPdf = data.cvPdf;
  if (data.portfolioPdf !== undefined) updatePayload.portfolioPdf = data.portfolioPdf;

  return await prisma.artistProfile.update({
    where: { id: artistId },
    data: updatePayload,
  });
};
