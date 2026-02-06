import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';
import { sendEmail } from '../../services/email';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export const createIntent = async (
  userId: string,
  items: Array<{ artworkId: string; quantity: number }>,
  shippingAddress?: any
) => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Get artwork details
  const artworkIds = items.map(item => item.artworkId);
  const artworks = await prisma.artwork.findMany({
    where: {
      id: { in: artworkIds },
      isAvailable: true,
    },
    include: {
      artist: true,
    },
  });

  if (artworks.length !== items.length) {
    throw createError('Some artworks are not available', 400);
  }

  // Calculate totals
  let subtotal = 0;
  const lineItems = items.map(item => {
    const artwork = artworks.find(a => a.id === item.artworkId)!;
    const amount = Number(artwork.price) * item.quantity;
    subtotal += amount;
    return {
      artwork,
      quantity: item.quantity,
      amount,
    };
  });

  // Calculate tax (simplified - would use tax calculation service in production)
  const taxRate = 0.19; // 19% VAT for Germany
  const taxAmount = subtotal * taxRate;

  // Calculate shipping (simplified)
  const shippingAmount = shippingAddress ? 15 : 0;

  const total = subtotal + taxAmount + shippingAmount;

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100), // Convert to cents
    currency: 'eur',
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId,
      items: JSON.stringify(items.map(item => ({
        artworkId: item.artworkId,
        quantity: item.quantity,
      }))),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: total,
    currency: 'eur',
    breakdown: {
      subtotal,
      tax: taxAmount,
      shipping: shippingAmount,
    },
  };
};

export const confirmPaymentIntent = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw createError('Payment not completed', 400);
  }

  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount / 100,
  };
};

export const handleWebhook = async (payload: any, signature: string) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
    }
  } catch (error: any) {
    logger.error('Webhook error:', error);
    throw createError(`Webhook Error: ${error.message}`, 400);
  }
};

const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent) => {
  const { userId, items: itemsJson } = paymentIntent.metadata || {};
  
  if (!userId || !itemsJson) {
    logger.error('Missing metadata in payment intent');
    return;
  }

  const items = JSON.parse(itemsJson);

  // Create purchase record
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    logger.error('User not found for payment');
    return;
  }

  // Get artwork details
  const artworkIds = items.map((item: any) => item.artworkId);
  const artworks = await prisma.artwork.findMany({
    where: { id: { in: artworkIds } },
    include: { artist: true },
  });

  // Calculate totals
  let subtotal = 0;
  const purchaseItems = items.map((item: any) => {
    const artwork = artworks.find(a => a.id === item.artworkId)!;
    const unitPrice = Number(artwork.price);
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;
    return {
      artworkId: item.artworkId,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    };
  });

  const taxAmount = subtotal * 0.19;
  const total = subtotal + taxAmount;

  // Create purchase
  const purchase = await prisma.purchase.create({
    data: {
      userId,
      orderNumber: `GM-${Date.now()}`,
      status: 'COMPLETED',
      subtotal,
      taxAmount,
      shippingAmount: 0,
      total,
      currency: 'EUR',
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntent.id,
      items: {
        create: purchaseItems,
      },
    },
    include: {
      items: {
        include: {
          artwork: true,
        },
      },
    },
  });

  // Update artwork stats
  for (const item of items) {
    await prisma.artwork.update({
      where: { id: item.artworkId },
      data: {
        purchaseCount: { increment: item.quantity },
      },
    });
  }

  // Clear cart
  await prisma.cartItem.deleteMany({
    where: {
      userId,
      artworkId: { in: artworkIds },
    },
  });

  // Send confirmation email
  await sendEmail({
    to: user.email,
    subject: 'Order Confirmation - Gaiamundi',
    template: 'purchase-confirmation',
    data: {
      firstName: user.firstName,
      orderNumber: purchase.orderNumber,
      orderDate: purchase.createdAt.toLocaleDateString(),
      items: purchase.items.map((item: any) => ({
        title: item.artwork.title,
        artist: item.artwork.artistId,
        price: item.unitPrice,
        quantity: item.quantity,
      })),
      total: purchase.total,
      hasDigitalItems: purchase.items.some((item: any) => item.artwork.isDigital),
      downloadUrl: `${process.env.FRONTEND_URL}/account/downloads`,
    },
  });

  logger.info(`Purchase completed: ${purchase.orderNumber}`);
};

const handlePaymentFailure = async (paymentIntent: Stripe.PaymentIntent) => {
  logger.error(`Payment failed: ${paymentIntent.id}`);
  // Could notify user, update order status, etc.
};
