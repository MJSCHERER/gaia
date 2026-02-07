import {
  PrismaClient,
  UserRole,
  AccountStatus,
  ArtworkCategory,
  PurchaseStatus,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- USERS ---
  const usersData: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    avatar: string;
    bio: string;
  }[] = [
    {
      firstName: 'Mel',
      lastName: 'X.',
      email: 'mel@gaimundi.com',
      role: UserRole.ARTIST,
      avatar: faker.image.avatar(),
      bio: '...',
    },
    {
      firstName: 'Lena',
      lastName: 'E.',
      email: 'lena@gaimundi.com',
      role: UserRole.ARTIST,
      avatar: faker.image.avatar(),
      bio: '...',
    },
  ];

  // Extra Users
  for (let i = 0; i < 8; i++) {
    usersData.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      role: i < 3 ? UserRole.ARTIST : UserRole.COLLECTOR,
      avatar: faker.image.avatar(),
      bio: faker.person.bio(),
    });
  }

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {}, // nix ändern
      create: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: faker.internet.password(),
        role: userData.role,
        status: AccountStatus.ACTIVE,
        emailVerified: true,
        avatar: userData.avatar,
        bio: userData.bio,
      },
    });
    users.push(user);
  }

  // --- ARTIST PROFILES ---
  const artistProfilesData = [
    {
      userId: users[0].id,
      artistName: 'Mel',
      slug: 'mel',
      bio: users[0].bio ?? '',
      website: 'https://mel.art',
      instagram: '@mel.art',
      facebook: 'melart',
      twitter: '@mel_art',
    },
    {
      userId: users[1].id,
      artistName: 'Lena',
      slug: 'lena',
      bio: users[1].bio ?? '',
      website: 'https://lena.art',
      instagram: '@lena.art',
      facebook: 'lenaart',
      twitter: '@lena_art',
    },
  ];

  // Restliche Artists (aus extra Users)
  for (const user of users.slice(2, 5)) {
    artistProfilesData.push({
      userId: user.id,
      artistName: `${user.firstName} ${user.lastName}`,
      slug: faker.helpers.slugify(`${user.firstName}-${user.lastName}`).toLowerCase(),
      bio: user.bio ?? '',
      website: faker.internet.url(),
      instagram: `@${faker.internet.username()}`,
      facebook: faker.internet.username(),
      twitter: `@${faker.internet.username()}`,
    });
  }

  // --- ArtistProfiles erstellen ---
  const artistProfiles: { id: string; slug: string }[] = [];
  for (const artistData of artistProfilesData) {
    const profile = await prisma.artistProfile.upsert({
      where: { userId: artistData.userId },
      update: {}, // nix ändern
      create: {
        ...artistData,
        statement: faker.lorem.sentences(3),
        totalSales: faker.number.int({ min: 0, max: 100 }),
        totalRevenue: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
      },
    });
    artistProfiles.push(profile);
  }

  // --- ARTWORKS ---
  const artworksData = [
    { artistSlug: 'mel', title: 'Cosmic Dreams', category: ArtworkCategory.FANTASY, price: 450 },
    { artistSlug: 'mel', title: "Nature's Whisper", category: ArtworkCategory.NATURE, price: 520 },
    { artistSlug: 'mel', title: 'Morning Light', category: ArtworkCategory.NATURE, price: 350 },
    { artistSlug: 'mel', title: 'Forest Magic', category: ArtworkCategory.FANTASY, price: 550 },
    {
      artistSlug: 'lena',
      title: 'Ethereal Portrait',
      category: ArtworkCategory.PORTRAIT,
      price: 380,
    },
    { artistSlug: 'lena', title: 'Urban Fantasy', category: ArtworkCategory.FANTASY, price: 420 },
    { artistSlug: 'lena', title: 'Inner Vision', category: ArtworkCategory.PORTRAIT, price: 480 },
    {
      artistSlug: 'lena',
      title: 'Digital Dreams',
      category: ArtworkCategory.ILLUSTRATION,
      price: 390,
    },
  ];

  const artworks = [];
  for (const art of artworksData) {
    const artist = artistProfiles.find((a) => a.slug === art.artistSlug);
    if (!artist) continue;

    const artwork = await prisma.artwork.create({
      data: {
        artistId: artist.id,
        title: art.title,
        slug: faker.helpers.slugify(art.title).toLowerCase(),
        description: faker.lorem.paragraph(),
        category: art.category,
        thumbnail: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
        images: [
          faker.image.urlPicsumPhotos({ width: 800, height: 800 }),
          faker.image.urlPicsumPhotos({ width: 800, height: 800 }),
        ],
        price: art.price,
        isAvailable: true,
        isDigital: faker.datatype.boolean(),
        widthCm: faker.number.int({ min: 20, max: 120 }),
        heightCm: faker.number.int({ min: 20, max: 120 }),
        depthCm: faker.number.int({ min: 1, max: 10 }),
        weightKg: faker.number.float({ min: 0.5, max: 10, fractionDigits: 1 }),
        watermarkedImage: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      },
    });
    artworks.push(artwork);
  }

  // --- EXHIBITIONS ---
  for (const artist of artistProfiles) {
    const count = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < count; i++) {
      await prisma.exhibition.create({
        data: {
          artistId: artist.id,
          title: `${faker.word.adjective()} ${faker.word.noun()} Exhibition`,
          venue: faker.company.name(),
          location: `${faker.location.city()}, ${faker.location.country()}`,
          startDate: faker.date.past({ years: 3 }),
          endDate: faker.date.future({ years: 0.5 }),
          isSolo: faker.datatype.boolean(),
        },
      });
    }
  }

  // --- PUBLICATIONS ---
  for (const artist of artistProfiles) {
    const count = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < count; i++) {
      await prisma.publication.create({
        data: {
          artistId: artist.id,
          title: faker.lorem.words(3),
          publisher: faker.company.name(),
          date: faker.date.past({ years: 3 }),
          link: faker.internet.url(),
          description: faker.lorem.sentences(2),
        },
      });
    }
  }

  // --- PURCHASES ---
  const collectors = users.filter((u) => u.role === UserRole.COLLECTOR);
  for (const collector of collectors) {
    const purchaseCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < purchaseCount; i++) {
      if (artworks.length === 0) continue; // <-- schützt vor leerem Array
      const artwork = faker.helpers.arrayElement(artworks);
      const price = Number(artwork.price);
      await prisma.purchase.create({
        data: {
          userId: collector.id,
          orderNumber: faker.string.uuid(),
          status: faker.helpers.arrayElement(Object.values(PurchaseStatus)),
          subtotal: price,
          taxAmount: price * 0.2,
          shippingAmount: 15,
          total: price * 1.2 + 15,
          currency: 'EUR',
          paymentMethod: 'stripe',
          items: {
            create: [
              {
                artworkId: artwork.id,
                quantity: 1,
                unitPrice: artwork.price,
                totalPrice: artwork.price,
              },
            ],
          },
        },
      });
    }
  }
  console.log('Seeding completed!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
