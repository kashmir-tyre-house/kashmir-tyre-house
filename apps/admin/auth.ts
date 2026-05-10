import { getDb, adminUsers } from "@kth/db";
import { and, eq, sql } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { verifyPassword } from "./lib/password";

type AdminRole = "admin" | "manager" | "viewer";

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1)
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  pages: {
    signIn: "/login",
    error: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email Address", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const adminUser = await getActiveAdminUserByEmail(
          parsedCredentials.data.email
        );

        if (!adminUser?.passwordHash) {
          return null;
        }

        const isValidPassword = await verifyPassword(
          parsedCredentials.data.password,
          adminUser.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: adminUser.id,
          name: adminUser.name ?? adminUser.email,
          email: adminUser.email
        };
      }
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET
          })
        ]
      : [])
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user }) {
      const email = normalizeEmail(user.email);

      if (!email) {
        return false;
      }

      return Boolean(await getActiveAdminUserByEmail(email));
    },
    async jwt({ token, user }) {
      const email = normalizeEmail(user?.email ?? token.email);

      if (!email) {
        return token;
      }

      const adminUser = await getActiveAdminUserByEmail(email);

      if (!adminUser) {
        return token;
      }

      const adminToken = token as typeof token & {
        adminUserId?: string;
        adminRole?: AdminRole;
      };

      adminToken.adminUserId = adminUser.id;
      adminToken.adminRole = adminUser.role;
      adminToken.name = adminUser.name ?? adminToken.name;

      return adminToken;
    },
    session({ session, token }) {
      if (session.user) {
        const adminToken = token as typeof token & {
          adminUserId?: string;
          adminRole?: AdminRole;
        };
        const sessionUser = session.user as typeof session.user & {
          id?: string;
          role?: AdminRole;
        };

        if (adminToken.adminUserId) {
          sessionUser.id = adminToken.adminUserId;
        }

        if (adminToken.adminRole) {
          sessionUser.role = adminToken.adminRole;
        }
      }

      return session;
    },
    authorized({ auth, request }) {
      if (isPublicAuthPath(request.nextUrl.pathname)) {
        return true;
      }

      return Boolean(auth?.user);
    }
  }
});

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || null;
}

function isPublicAuthPath(pathname: string) {
  return (
    pathname.startsWith("/login") || pathname.startsWith("/forgot-password")
  );
}

function getAuthSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  if (process.env.NODE_ENV === "development") {
    return "kth-admin-local-development-secret";
  }

  return undefined;
}

async function getActiveAdminUserByEmail(email: string) {
  try {
    const db = getDb();
    const [adminUser] = await db
      .select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        role: adminUsers.role,
        passwordHash: adminUsers.passwordHash
      })
      .from(adminUsers)
      .where(
        and(
          eq(adminUsers.isActive, true),
          sql`lower(${adminUsers.email}) = ${email}`
        )
      )
      .limit(1);

    return adminUser ?? null;
  } catch (error) {
    console.error("Admin auth lookup failed", error);
    return null;
  }
}
