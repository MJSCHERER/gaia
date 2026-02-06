import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const setupPassport = () => {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback',
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const firstName = profile.name?.givenName || '';
            const lastName = profile.name?.familyName || '';
            const avatar = profile.photos?.[0]?.value;
            const googleId = profile.id;

            if (!email) {
              return done(new Error('No email provided by Google'), false);
            }

            // Check if user exists
            let user = await prisma.user.findFirst({
              where: {
                OR: [{ email }, { googleId }],
              },
            });

            if (user) {
              // Update Google ID if not set
              if (!user.googleId) {
                user = await prisma.user.update({
                  where: { id: user.id },
                  data: { googleId, avatar: avatar || user.avatar },
                });
              }
              return done(null, user);
            }

            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                googleId,
                avatar,
                emailVerified: true,
                status: 'ACTIVE',
                role: 'COLLECTOR',
              },
            });

            done(null, user);
          } catch (error) {
            logger.error('Google OAuth error:', error);
            done(error, false);
          }
        }
      )
    );
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: '/api/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'photos'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const firstName = profile.name?.givenName || '';
            const lastName = profile.name?.familyName || '';
            const avatar = profile.photos?.[0]?.value;
            const facebookId = profile.id;

            if (!email) {
              return done(new Error('No email provided by Facebook'), false);
            }

            // Check if user exists
            let user = await prisma.user.findFirst({
              where: {
                OR: [{ email }, { facebookId }],
              },
            });

            if (user) {
              // Update Facebook ID if not set
              if (!user.facebookId) {
                user = await prisma.user.update({
                  where: { id: user.id },
                  data: { facebookId, avatar: avatar || user.avatar },
                });
              }
              return done(null, user);
            }

            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                facebookId,
                avatar,
                emailVerified: true,
                status: 'ACTIVE',
                role: 'COLLECTOR',
              },
            });

            done(null, user);
          } catch (error) {
            logger.error('Facebook OAuth error:', error);
            done(error, false);
          }
        }
      )
    );
  }

  // Serialize user for session (not used with JWT, but required by passport)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
