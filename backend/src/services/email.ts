// backend/src/services/email.ts
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

type EmailTemplateName =
  | 'email-verification'
  | 'password-reset'
  | 'purchase-confirmation'
  | 'download-ready'
  | 'newsletter-welcome';

// Daten-Interfaces pro Template
interface EmailVerificationData {
  firstName: string;
  verificationUrl: string;
}

interface PasswordResetData {
  firstName: string;
  resetUrl: string;
}

interface PurchaseItemData {
  title: string;
  artist: string;
  price: string | number;
  quantity: number;
}

interface PurchaseConfirmationData {
  firstName: string;
  orderNumber: string;
  orderDate: string;
  items: PurchaseItemData[];
  total: string | number;
  hasDigitalItems?: boolean;
  downloadUrl?: string;
}

interface DownloadReadyData {
  firstName: string;
  artworkTitle: string;
  downloadUrl: string;
  expiryDate: string;
}

interface NewsletterWelcomeData {
  /* no dynamic fields required for current template but keep optional */
  firstName?: string;
}

// Mapping Helper: Template name -> data type
type EmailDataFor<T extends EmailTemplateName> = T extends 'email-verification'
  ? EmailVerificationData
  : T extends 'password-reset'
    ? PasswordResetData
    : T extends 'purchase-confirmation'
      ? PurchaseConfirmationData
      : T extends 'download-ready'
        ? DownloadReadyData
        : T extends 'newsletter-welcome'
          ? NewsletterWelcomeData
          : never;

interface EmailOptions<T extends EmailTemplateName> {
  to: string;
  subject: string;
  template: T;
  data: EmailDataFor<T>;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Templates: each function receives unknown and we cast to the correct shape inside
const templates = {
  'email-verification': (data: unknown) => {
    const d = data as EmailVerificationData;
    return {
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Gaiamundi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Gaiamundi</div>
          </div>
          <div class="content">
            <h2>Welcome to Gaiamundi, ${d.firstName}!</h2>
            <p>Thank you for joining our community of art lovers. To complete your registration, please verify your email address by clicking the button below:</p>
            <center><a href="${d.verificationUrl}" class="button">Verify Email</a></center>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${d.verificationUrl}">${d.verificationUrl}</a></p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Gaiamundi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
      text: `Welcome to Gaiamundi, ${d.firstName}!\n\nVerify: ${d.verificationUrl}\n\nThis link will expire in 24 hours.\n\n© ${new Date().getFullYear()} Gaiamundi.`,
    };
  },

  'password-reset': (data: unknown) => {
    const d = data as PasswordResetData;
    return {
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Gaiamundi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2>Hello ${d.firstName},</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p><a href="${d.resetUrl}" style="display:inline-block;padding:12px 24px;background:#8B5CF6;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a></p>
          <p>Or copy and paste this link into your browser:</p>
          <p>${d.resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      </body>
      </html>
    `,
      text: `Hello ${d.firstName},\n\nReset your password: ${d.resetUrl}\n\nThis link will expire in 1 hour.\n\n© ${new Date().getFullYear()} Gaiamundi.`,
    };
  },

  'purchase-confirmation': (data: unknown) => {
    const d = data as PurchaseConfirmationData;
    const itemsHtml = d.items
      .map(
        (it) => `
          <div style="padding:8px 0;border-bottom:1px solid #eee;">
            <p style="margin:0;"><strong>${it.title}</strong> by ${it.artist}</p>
            <p style="margin:0;">€${it.price} x ${it.quantity}</p>
          </div>
        `,
      )
      .join('');

    const itemsText = d.items
      .map((it) => `- ${it.title} by ${it.artist} - €${it.price} x ${it.quantity}`)
      .join('\n');

    return {
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Gaiamundi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
          .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2>Thank you for your purchase, ${d.firstName}!</h2>
          <p>Your order has been confirmed. Order #: <strong>${d.orderNumber}</strong></p>
          <p>Date: ${d.orderDate}</p>
          <div style="background:#fff;padding:12px;border-radius:6px;">${itemsHtml}
            <div style="margin-top:12px;font-weight:bold;">Total: €${d.total}</div>
          </div>
          ${d.hasDigitalItems ? `<p style="margin-top:16px;">You can download your digital items here: <a href="${d.downloadUrl}">Download</a></p>` : ''}
          <p style="margin-top:20px;">If you have any questions, please contact our support team.</p>
        </div>
      </body>
      </html>
    `,
      text: `Thank you for your purchase, ${d.firstName}!\n\nOrder #: ${d.orderNumber}\nDate: ${d.orderDate}\n\nItems:\n${itemsText}\n\nTotal: €${d.total}\n\n${d.hasDigitalItems ? `Download: ${d.downloadUrl}\n\n` : ''}If you have any questions, contact support.\n\n© ${new Date().getFullYear()} Gaiamundi.`,
    };
  },

  'download-ready': (data: unknown) => {
    const d = data as DownloadReadyData;
    return {
      html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2>Your download is ready, ${d.firstName}!</h2>
          <p>Your purchase <strong>${d.artworkTitle}</strong> is now available for download.</p>
          <p><a href="${d.downloadUrl}" style="display:inline-block;padding:10px 18px;background:#8B5CF6;color:#fff;border-radius:6px;text-decoration:none;">Download Now</a></p>
          <p>This download link will expire on ${d.expiryDate}.</p>
        </div>
      </body>
      </html>
    `,
      text: `Your download is ready, ${d.firstName}!\n\nArtwork: ${d.artworkTitle}\nDownload: ${d.downloadUrl}\nExpires: ${d.expiryDate}\n\n© ${new Date().getFullYear()} Gaiamundi.`,
    };
  },

  'newsletter-welcome': (data: unknown) => {
    const d = (data as NewsletterWelcomeData) || {};
    const name = d.firstName ?? 'Friend';
    return {
      html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2>Welcome to our newsletter, ${name}!</h2>
          <p>Thank you for subscribing to the Gaiamundi newsletter. You'll be the first to know about new artworks, offers, and artist spotlights.</p>
        </div>
      </body>
      </html>
    `,
      text: `Welcome to our newsletter, ${name}!\n\nThank you for subscribing to Gaiamundi.\n\n© ${new Date().getFullYear()} Gaiamundi.`,
    };
  },
} as const;

// Send email (typsicher)
export const sendEmail = async <T extends EmailTemplateName>(
  options: EmailOptions<T>,
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const templateFn = (
      templates as Record<EmailTemplateName, (d: unknown) => { html: string; text: string }>
    )[options.template];

    if (!templateFn) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const { html, text } = templateFn(options.data as unknown);

    await transporter.sendMail({
      from: `"Gaiamundi" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html,
      text,
    });

    logger.info(`Email sent: ${options.template} to ${options.to}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};
