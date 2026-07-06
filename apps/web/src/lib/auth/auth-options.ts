import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import { rateLimits } from '@/lib/rate-limit';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      plan: string;
      rol: string;
      consentimientoDatos: boolean;
    };
  }
  interface User {
    id: string;
    plan: string;
    rol: string;
    consentimientoDatos: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    plan: string;
    rol: string;
    consentimientoDatos: boolean;
    lastRefresh?: number;
  }
}

const DEV_USER = {
  id: 'dev-admin-id',
  email: 'camilojerez35@gmail.com',
  name: 'Camilo Jerez (Dev)',
  image: null,
  plan: 'EMPRESARIAL',
  rol: 'SUPERADMIN',
  consentimientoDatos: true,
};

export const authOptions: AuthOptions = {
  providers: [
    // Dev-only: bypass sin DB — solo activo si NODE_ENV=development Y DEV_BYPASS_ENABLED=true
    ...(process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_ENABLED === 'true' ? [
      CredentialsProvider({
        id: 'dev-bypass',
        name: 'Dev Bypass',
        credentials: { secret: { label: 'secret', type: 'text' } },
        async authorize(credentials) {
          if (credentials?.secret === 'dev-mindbridge-2026') return DEV_USER;
          return null;
        },
      }),
    ] : []),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // Rate limiting por IP en el punto real de autenticación
        const rawIp =
          (req as any)?.headers?.['x-forwarded-for'] ??
          (req as any)?.socket?.remoteAddress ??
          'unknown';
        const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'unknown';
        const { allowed } = await rateLimits.login(ip);
        if (!allowed) return null;

        const usuario = await db.usuario.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            imagen: true,
            hashedPassword: true,
            planActual: true,
            rol: true,
            estado: true,
            emailVerificado: true,
            consentimientoDatos: true,
          },
        });

        if (!usuario || !usuario.hashedPassword) return null;

        if (usuario.estado === 'SUSPENDIDO' || usuario.estado === 'ELIMINADO') return null;

        if (!usuario.emailVerificado) return null;

        const passwordValida = await bcrypt.compare(credentials.password, usuario.hashedPassword);
        if (!passwordValida) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || null,
          image: usuario.imagen,
          plan: usuario.planActual,
          rol: usuario.rol,
          consentimientoDatos: usuario.consentimientoDatos,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.plan = user.plan ?? 'GRATIS';
        token.rol = user.rol ?? 'USUARIO';
        token.consentimientoDatos = user.consentimientoDatos ?? false;
      }

      // Refresca rol y plan desde BD cada 5 minutos, no en cada request
      const REFRESH_INTERVAL = 5 * 60 * 1000;
      if (!user && !account && token.id && token.id !== 'dev-admin-id') {
        const now = Date.now();
        if (!token.lastRefresh || now - token.lastRefresh > REFRESH_INTERVAL) {
          const fresco = await db.usuario.findUnique({
            where: { id: token.id },
            select: { rol: true, planActual: true },
          }).catch(() => null);
          if (fresco) {
            token.rol = fresco.rol;
            token.plan = fresco.planActual;
            token.lastRefresh = now;
          }
        }
      }

      if (account?.provider === 'google' && token.email) {
        const usuario = await db.usuario.upsert({
          where: { email: token.email },
          update: { ultimoAcceso: new Date() },
          create: {
            email: token.email,
            nombre: token.name ?? null,
            imagen: token.picture as string ?? null,
            consentimientoDatos: false,
            emailVerificado: new Date(), // Google verifica el email por nosotros
          },
          select: { id: true, planActual: true, rol: true, consentimientoDatos: true },
        });
        token.id = usuario.id;
        token.plan = usuario.planActual;
        token.rol = usuario.rol;
        token.consentimientoDatos = usuario.consentimientoDatos;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.plan = token.plan;
        session.user.rol = token.rol;
        session.user.consentimientoDatos = token.consentimientoDatos ?? false;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      if (user.id && user.id !== 'dev-admin-id') {
        await db.usuario.update({
          where: { id: user.id },
          data: { ultimoAcceso: new Date() },
        }).catch(() => null);
      }
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
