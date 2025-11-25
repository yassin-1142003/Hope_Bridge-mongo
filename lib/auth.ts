// lib/auth.ts - Auth configuration using MongoDB/Mongoose
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDb } from "@/backend/database/mongoose/connection";
import { UserModel } from "@/backend/database/mongoose/models";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDb();

        const userDoc = await UserModel.findOne({ email: credentials.email });
        if (!userDoc) return null;

        const validPassword = await bcrypt.compare(
          credentials.password,
          userDoc.hash,
        );
        if (!validPassword) return null;

        return {
          id: String(userDoc._id),
          role: userDoc.role,
          email: userDoc.email,
          name: `${userDoc.firstName} ${userDoc.lastName || ""}`,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && typeof (user as { role?: unknown }).role === "string") {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
