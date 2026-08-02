import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

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
          const user = await User.findOne({ email }).select("password name email role isActive");

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
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[auth] authorize failed — is MongoDB running?", error);
          // Returning null surfaces as CredentialsSignin on the client
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const role = (user as { role?: "user" | "admin" }).role;
        token.role = role === "admin" ? "admin" : "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin") ?? "user";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
