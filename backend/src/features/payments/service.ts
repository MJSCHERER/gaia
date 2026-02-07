import Stripe from 'stripe';
import { PrismaClient, Address } from '@prisma/client';
import { createError } from '../../middleware/errorHandler.js';
import { sendEmail } from '../../services/email.js';
import { logger } from '../../utils/logger.js';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// --- Helper types ---
export interface CartItemInput {
  artworkId: string;
  quantity: number;
}

interface PurchasedItem {
  artworkId: string;
  quantity: number;
}

interface CreateIntentResult {
  clientSecret: string | null;
  paymentIntentId: string;
  amount: number;
  currency: string;
  breakdown: {
    subtotal: number;
    tax: number;
    shipping: number;
  };
}

// -----------------------------
// Create a Stripe Payment Intent
// -----------------------------
export const createIntent = async (
  userId: string,
  items: CartItemInput[],
  shippingAddress?: Address | null,
): Promise<CreateIntentResult> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw createError('User not found', 404);

  const artworkIds = items.map((i) => i.artworkId);
  const artworks = await prisma.artwork.findMany({
    where: { id: { in: artworkIds }, isAvailable: true },
    include: { artist: true },
  });

  if (artworks.length !== items.length) throw createError('Some artworks are not available', 400);

  let subtotal = 0;
  for (const it of items) {
    const art = artworks.find((a) => a.id === it.artworkId)!;
    subtotal += Number(art.price) * it.quantity;
  }

  const taxRate = 0.19;
  const taxAmount = subtotal * taxRate;
  const shippingAmount = shippingAddress ? 15 : 0;
  const total = subtotal + taxAmount + shippingAmount;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: 'eur',
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId,
      items: JSON.stringify(items.map((i) => ({ artworkId: i.artworkId, quantity: i.quantity }))),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret ?? null,
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

// -----------------------------
// Confirm payment intent status
// -----------------------------
export const confirmPaymentIntent = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') throw createError('Payment not completed', 400);

  return {
    status: paymentIntent.status,
    amount: (paymentIntent.amount ?? 0) / 100,
  };
};

// -----------------------------
// Webhook handler
// -----------------------------
export const handleWebhook = async (payload: string | Buffer, signature: string) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    ) as Stripe.Event;

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        logger.info(`Unhandled stripe event type: ${event.type}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown webhook error';
    logger.error('Webhook error:', err);
    throw createError(`Webhook Error: ${message}`, 400);
  }
};

// -----------------------------
// Payment success handling
// -----------------------------
const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent) => {
  const metadata = paymentIntent.metadata ?? {};
  const userId = metadata.userId as string | undefined;
  const itemsJson = metadata.items as string | undefined;

  if (!userId || !itemsJson) {
    logger.error('Missing metadata in payment intent', { paymentIntentId: paymentIntent.id });
    return;
  }

  let items: PurchasedItem[];
  try {
    items = JSON.parse(itemsJson) as PurchasedItem[];
  } catch (e) {
    logger.error('Invalid items JSON in metadata', { err: e });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    logger.error('User not found for payment', { userId });
    return;
  }

  const artworkIds = items.map((it) => it.artworkId);
  const artworks = await prisma.artwork.findMany({
    where: { id: { in: artworkIds } },
    include: { artist: true },
  });

  let subtotal = 0;
  const purchaseItemsForCreate = items.map((it) => {
    const art = artworks.find((a) => a.id === it.artworkId);
    if (!art) throw new Error(`Artwork not found during purchase creation: ${it.artworkId}`);
    const unitPrice = Number(art.price);
    const totalPrice = unitPrice * it.quantity;
    subtotal += totalPrice;

    return {
      artworkId: it.artworkId,
      quantity: it.quantity,
      unitPrice,
      totalPrice,
    };
  });

  const taxAmount = subtotal * 0.19;
  const total = subtotal + taxAmount;

  // Create purchase record
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
        create: purchaseItemsForCreate.map((pi) => ({
          artworkId: pi.artworkId,
          quantity: pi.quantity,
          unitPrice: pi.unitPrice,
          totalPrice: pi.totalPrice,
        })),
      },
    },
    include: {
      items: { include: { artwork: { include: { artist: true } } } },
    },
  });

  // Update artwork purchase counts
  for (const it of items) {
    await prisma.artwork.update({
      where: { id: it.artworkId },
      data: { purchaseCount: { increment: it.quantity } },
    });
  }

  // Remove from cart
  await prisma.cartItem.deleteMany({
    where: { userId, artworkId: { in: artworkIds } },
  });

  // Prepare items for email
  const emailItems = purchase.items.map((pi) => ({
    title: pi.artwork.title,
    artist: pi.artwork.artist.artistName ?? String(pi.artwork.artistId),
    price: Number(pi.unitPrice),
    quantity: pi.quantity,
  }));

  // Convert Decimal to number/string for email
  const emailTotal: number = Number(purchase.total);

  try {
    await sendEmail({
      to: user.email,
      subject: 'Order Confirmation - Gaiamundi',
      template: 'purchase-confirmation',
      data: {
        firstName: user.firstName,
        orderNumber: purchase.orderNumber,
        orderDate: purchase.createdAt.toLocaleDateString(),
        items: emailItems,
        total: emailTotal,
        hasDigitalItems: purchase.items.some((i) => i.artwork.isDigital),
        downloadUrl: `${process.env.FRONTEND_URL}/account/downloads`,
      },
    });
  } catch (err) {
    logger.error('Failed to send purchase confirmation email', { err, userId: user.id });
  }

  logger.info(`Purchase completed: ${purchase.orderNumber}`);
};

// -----------------------------
// Payment failure handling
// -----------------------------
const handlePaymentFailure = async (paymentIntent: Stripe.PaymentIntent) => {
  logger.error(`Payment failed: ${paymentIntent.id}`, { status: paymentIntent.status });
};
