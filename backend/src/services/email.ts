import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const templates: Record<string, (data: any) => { html: string; text: string }> = {
  'email-verification': (data) => ({
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
            <h2>Welcome to Gaiamundi, ${data.firstName}!</h2>
            <p>Thank you for joining our community of art lovers. To complete your registration, please verify your email address by clicking the button below:</p>
            <center><a href="${data.verificationUrl}" class="button">Verify Email</a></center>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${data.verificationUrl}">${data.verificationUrl}</a></p>
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
    text: `
Welcome to Gaiamundi, ${data.firstName}!

Thank you for joining our community of art lovers. To complete your registration, please verify your email address by visiting this link:

${data.verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

© ${new Date().getFullYear()} Gaiamundi. All rights reserved.
    `,
  }),

  'password-reset': (data) => ({
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
        <div class="container">
          <div class="header">
            <div class="logo">Gaiamundi</div>
          </div>
          <div class="content">
            <h2>Hello ${data.firstName},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <center><a href="${data.resetUrl}" class="button">Reset Password</a></center>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${data.resetUrl}">${data.resetUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gaiamundi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${data.firstName},

We received a request to reset your password. Visit this link to create a new password:

${data.resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} Gaiamundi. All rights reserved.
    `,
  }),

  'purchase-confirmation': (data) => ({
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
        <div class="container">
          <div class="header">
            <div class="logo">Gaiamundi</div>
          </div>
          <div class="content">
            <h2>Thank you for your purchase, ${data.firstName}!</h2>
            <p>Your order has been confirmed. Here are the details:</p>
            <div class="order-details">
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Date:</strong> ${data.orderDate}</p>
              <h3>Items:</h3>
              ${data.items.map((item: any) => `
                <div class="item">
                  <p><strong>${item.title}</strong> by ${item.artist}</p>
                  <p>€${item.price} x ${item.quantity}</p>
                </div>
              `).join('')}
              <div class="total">
                <p>Total: €${data.total}</p>
              </div>
            </div>
            ${data.hasDigitalItems ? `
              <p>You can download your digital items from your account:</p>
              <center><a href="${data.downloadUrl}" class="button">Download Files</a></center>
            ` : ''}
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gaiamundi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Thank you for your purchase, ${data.firstName}!

Your order has been confirmed. Here are the details:

Order Number: ${data.orderNumber}
Date: ${data.orderDate}

Items:
${data.items.map((item: any) => `- ${item.title} by ${item.artist} - €${item.price} x ${item.quantity}`).join('\n')}

Total: €${data.total}

${data.hasDigitalItems ? `You can download your digital items from your account: ${data.downloadUrl}` : ''}

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} Gaiamundi. All rights reserved.
    `,
  }),

  'download-ready': (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Download is Ready - Gaiamundi</title>
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
            <h2>Your download is ready, ${data.firstName}!</h2>
            <p>Your purchase <strong>${data.artworkTitle}</strong> is now available for download.</p>
            <center><a href="${data.downloadUrl}" class="button">Download Now</a></center>
            <p>This download link will expire on ${data.expiryDate}.</p>
            <p>If you have any issues downloading, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gaiamundi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Your download is ready, ${data.firstName}!

Your purchase "${data.artworkTitle}" is now available for download.

Download link: ${data.downloadUrl}

This download link will expire on ${data.expiryDate}.

If you have any issues downloading, please contact our support team.

© ${new Date().getFullYear()} Gaiamundi. All rights reserved.
    `,
  }),

  'newsletter-welcome': (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Gaiamundi Newsletter</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Gaiamundi</div>
          </div>
          <div class="content">
            <h2>Welcome to our newsletter!</h2>
            <p>Thank you for subscribing to the Gaiamundi newsletter. You'll be the first to know about:</p>
            <ul>
              <li>New artworks and collections</li>
              <li>Exclusive offers and promotions</li>
              <li>Artist spotlights and behind-the-scenes content</li>
              <li>Upcoming exhibitions and events</li>
            </ul>
            <p>We're excited to share our journey with you!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gaiamundi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to our newsletter!

Thank you for subscribing to the Gaiamundi newsletter. You'll be the first to know about:

- New artworks and collections
- Exclusive offers and promotions
- Artist spotlights and behind-the-scenes content
- Upcoming exhibitions and events

We're excited to share our journey with you!

© ${new Date().getFullYear()} Gaiamundi. All rights reserved.
    `,
  }),
};

// Send email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    const template = templates[options.template];

    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const { html, text } = template(options.data);

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
