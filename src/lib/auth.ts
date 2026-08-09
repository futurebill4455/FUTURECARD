import { getAuthSecret } from "@/lib/auth-secret";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { findUserByEmail } from "@/lib/db/users";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();

          const email = credentials.email.trim().toLowerCase();
          const user = await findUserByEmail(email, { includePassword: true });

          if (!user) {
            console.warn(`[auth] No user found for email: ${email}`);
            return null;
          }

          if (!user.isActive) {
            console.warn(`[auth] Inactive user: ${email}`);
            return null;
          }

          if (!user.password) {
            console.error(`[auth] User missing password hash: ${email}`);
            return null;
          }

          const valid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!valid) {
            console.warn(`[auth] Bad password for: ${email}`);
            return null;
          }

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error(
            "[auth] authorize failed — is Supabase configured?",
            error,
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        const role = (user as { role?: "user" | "admin" }).role;
        token.role = role === "admin" ? "admin" : "user";
      }

      if (trigger === "update" && session) {
        const s = session as { name?: string; email?: string };
        if (typeof s.name === "string") token.name = s.name;
        if (typeof s.email === "string") token.email = s.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin") || "user";
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: getAuthSecret(),
};
