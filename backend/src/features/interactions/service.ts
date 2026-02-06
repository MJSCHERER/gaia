import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface InteractionData {
  userId?: string;
  sessionId?: string;
  interactionType: string;
  metadata?: any;
}

export const trackUserInteraction = async (data: InteractionData) => {
  await prisma.hiddenInteraction.create({
    data: {
      userId: data.userId,
      sessionId: data.sessionId,
      interactionType: data.interactionType,
      metadata: data.metadata || {},
    },
  });
};

export const getAllInteractions = async () => {
  const interactions = await prisma.hiddenInteraction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return interactions;
};

export const getInteractionStats = async () => {
  const stats = await prisma.hiddenInteraction.groupBy({
    by: ['interactionType'],
    _count: {
      id: true,
    },
  });

  return stats;
};
