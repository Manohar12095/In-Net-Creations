import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import crypto from 'crypto';

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

const FALLBACK_SECRET = 'innet-creations-admin-super-secret-key-2024-madurai';
const DEFAULT_ADMIN_PASSWORD = 'innetadmin2024';

// Ensure NEXTAUTH_URL and NEXTAUTH_SECRET are always set in production environments (e.g. Vercel)
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = FALLBACK_SECRET;
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://in-net-creations.vercel.app';
}

/**
 * NextAuth configuration for the Admin CMS.
 *
 * Authentication: single admin user with a password.
 * Supports ADMIN_PASSWORD env var with fallback to default admin password.
 */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Password',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
        if (!credentials?.password) return null;

        const submitted = String(credentials.password).trim();
        const expected = String(adminPassword).trim();

        // Timing-safe comparison to prevent timing side-channel attacks
        const isValid =
          safeCompare(submitted, expected) ||
          (await bcrypt
            .compare(submitted, expected)
            .catch(() => false));

        if (!isValid) return null;

        // Return a minimal user object (no real DB needed)
        return { id: 'admin', name: 'Admin', email: 'admin@innetcreations.in' };
      },
    }),
  ],

  pages: {
    signIn: '/admin/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = 'admin';
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token?.role || 'admin';
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
};

const handler = NextAuth(authOptions);

export async function GET(req, context) {
  return handler(req, context);
}

export async function POST(req, context) {
  return handler(req, context);
}
