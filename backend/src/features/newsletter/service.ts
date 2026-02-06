import { PrismaClient } from '@prisma/client';
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
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Already subscribed, reactivate if unsubscribed
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
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    orderBy: { subscribedAt: 'desc' },
  });

  return subscribers;
};
