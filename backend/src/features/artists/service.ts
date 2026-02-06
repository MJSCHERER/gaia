import { PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export const getArtists = async () => {
  const artists = await prisma.artistProfile.findMany({
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
      user: {
        select: {
          avatar: true,
        },
      },
      _count: {
        select: {
          artworks: true,
        },
      },
    },
  });

  return artists;
};

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
      user: {
        select: {
          avatar: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          artworks: true,
          exhibitions: true,
          publications: true,
        },
      },
    },
  });

  if (!artist) {
    throw createError('Artist not found', 404);
  }

  return artist;
};

export const getArtistWorks = async (
  slug: string,
  options: { page: number; limit: number }
) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const artist = await prisma.artistProfile.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!artist) {
    throw createError('Artist not found', 404);
  }

  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where: {
        artistId: artist.id,
        isAvailable: true,
      },
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
    prisma.artwork.count({
      where: {
        artistId: artist.id,
        isAvailable: true,
      },
    }),
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

export const getExhibitions = async (slug: string) => {
  const artist = await prisma.artistProfile.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!artist) {
    throw createError('Artist not found', 404);
  }

  const exhibitions = await prisma.exhibition.findMany({
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

  return exhibitions;
};

export const getPublications = async (slug: string) => {
  const artist = await prisma.artistProfile.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!artist) {
    throw createError('Artist not found', 404);
  }

  const publications = await prisma.publication.findMany({
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

  return publications;
};

export const createArtist = async (userId: string, data: any) => {
  // Check if user already has an artist profile
  const existingProfile = await prisma.artistProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    throw createError('Artist profile already exists', 409);
  }

  // Update user role to ARTIST
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'ARTIST' },
  });

  // Create artist profile
  const artist = await prisma.artistProfile.create({
    data: {
      userId,
      artistName: data.artistName,
      slug: data.slug || data.artistName.toLowerCase().replace(/\s+/g, '-'),
      bio: data.bio,
      statement: data.statement,
      website: data.website,
      instagram: data.instagram,
      facebook: data.facebook,
      twitter: data.twitter,
      youtube: data.youtube,
    },
  });

  return artist;
};

export const updateArtist = async (
  artistId: string,
  userId: string,
  data: any
) => {
  // Check ownership
  const artist = await prisma.artistProfile.findFirst({
    where: {
      id: artistId,
      userId,
    },
  });

  if (!artist) {
    throw createError('Artist profile not found or unauthorized', 404);
  }

  const updated = await prisma.artistProfile.update({
    where: { id: artistId },
    data: {
      artistName: data.artistName,
      bio: data.bio,
      statement: data.statement,
      website: data.website,
      instagram: data.instagram,
      facebook: data.facebook,
      twitter: data.twitter,
      youtube: data.youtube,
      cvPdf: data.cvPdf,
      portfolioPdf: data.portfolioPdf,
    },
  });

  return updated;
};
