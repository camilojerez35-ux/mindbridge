import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db/client';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      plan: string;
      rol: string;
    };
  }
  interface User {
    id: string;
    plan: string;
    rol: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    plan: string;
    rol: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

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
          },
        });

        if (!usuario || !usuario.hashedPassword) return null;

        if (usuario.estado === 'SUSPENDIDO' || usuario.estado === 'ELIMINADO') return null;

        const passwordValida = await bcrypt.compare(credentials.password, usuario.hashedPassword);
        if (!passwordValida) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || null,
          image: usuario.imagen,
          plan: usuario.planActual,
          rol: usuario.rol,
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.plan = user.plan ?? 'GRATIS';
        token.rol = user.rol ?? 'USUARIO';
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
          },
          select: { id: true, planActual: true, rol: true },
        });
        token.id = usuario.id;
        token.plan = usuario.planActual;
        token.rol = usuario.rol;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.plan = token.plan;
        session.user.rol = token.rol;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      if (user.id) {
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
