import { PrismaClient, Prisma } from '@prisma/client';
import { sendEmail } from '../../services/email';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

interface SubscribeData {
  email: string;
  firstName?: string;
  lastName?: string;
  language?: string;
}

export const addSubscriber = async (data: SubscribeData) => {
  try {
    await prisma.newsletterSubscriber.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        language: data.language || 'en',
      },
    });

    // Send welcome email
    await sendEmail({
      to: data.email,
      subject: 'Welcome to Gaiamundi Newsletter',
      template: 'newsletter-welcome',
      data: {
        firstName: data.firstName || 'Art Lover',
      },
    });

    logger.info(`Newsletter subscription: ${data.email}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      await prisma.newsletterSubscriber.update({
        where: { email: data.email },
        data: {
          isActive: true,
          unsubscribedAt: null,
        },
      });
    } else {
      throw error;
    }
  }
};

export const removeSubscriber = async (email: string) => {
  await prisma.newsletterSubscriber.update({
    where: { email },
    data: {
      isActive: false,
      unsubscribedAt: new Date(),
    },
  });

  logger.info(`Newsletter unsubscription: ${email}`);
};

export const getAllSubscribers = async () => {
  return prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    orderBy: { subscribedAt: 'desc' },
  });
};

// ✅ Prisma JSON-kompatibles Metadata-Typ
export const trackUserInteraction = async ({
  userId,
  sessionId,
  interactionType,
  metadata,
}: {
  userId?: string;
  sessionId?: string;
  interactionType: string;
  metadata?: Prisma.JsonObject; // ← hier anpassen
}) => {
  await prisma.hiddenInteraction.create({
    data: {
      userId,
      sessionId,
      interactionType,
      metadata,
    },
  });
};

export const getAllInteractions = async () => {
  return prisma.hiddenInteraction.findMany({
    orderBy: { createdAt: 'desc' },
  });
};
