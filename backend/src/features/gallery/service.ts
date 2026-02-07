import { PrismaClient, Prisma, ArtworkCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface GalleryFilters {
  artist?: string;
  category?: string;
  page: number;
  limit: number;
  sort: string;
}

export const getGalleryArtworks = async (filters: GalleryFilters) => {
  const { artist, category, page, limit, sort } = filters;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ArtworkWhereInput = {
    isAvailable: true,
  };

  if (artist) {
    where.artist = {
      slug: artist,
    };
  }

  if (category) {
    const upper = category.toUpperCase();
    // Prüfen, ob der String ein gültiger Enum-Wert ist
    if (Object.values(ArtworkCategory).includes(upper as ArtworkCategory)) {
      where.category = upper as ArtworkCategory;
    } else {
      throw new Error(`Invalid category: ${category}`);
    }
  }

  // Build order by
  let orderBy: Prisma.Enumerable<Prisma.ArtworkOrderByWithRelationInput> = [];
  switch (sort) {
    case 'newest':
      orderBy = [{ createdAt: 'desc' }];
      break;
    case 'oldest':
      orderBy = [{ createdAt: 'asc' }];
      break;
    case 'price-low':
      orderBy = [{ price: 'asc' }];
      break;
    case 'price-high':
      orderBy = [{ price: 'desc' }];
      break;
    case 'popular':
      orderBy = [{ viewCount: 'desc' }];
      break;
    default:
      orderBy = [{ createdAt: 'desc' }];
  }

  // Get artworks
  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where,
      orderBy,
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
        viewCount: true,
        wishlistCount: true,
        createdAt: true,
        artist: {
          select: {
            artistName: true,
            slug: true,
            user: {
              select: {
                avatar: true,
              },
            },
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

export const getFeatured = async () => {
  const artworks = await prisma.artwork.findMany({
    where: {
      isAvailable: true,
    },
    orderBy: [{ purchaseCount: 'desc' }, { viewCount: 'desc' }],
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      price: true,
      currency: true,
      category: true,
      artist: {
        select: {
          artistName: true,
          slug: true,
        },
      },
    },
  });

  return artworks;
};

export const getArtistsForPreview = async () => {
  const artists = await prisma.artistProfile.findMany({
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
      _count: {
        select: {
          artworks: true,
        },
      },
      artworks: {
        where: {
          isAvailable: true,
        },
        take: 4,
        select: {
          id: true,
          thumbnail: true,
          title: true,
        },
      },
    },
  });

  return artists.map((artist) => ({
    id: artist.id,
    name: artist.artistName,
    slug: artist.slug,
    bio: artist.bio,
    avatar: artist.user.avatar,
    artworkCount: artist._count.artworks,
    previewImages: artist.artworks,
  }));
};
