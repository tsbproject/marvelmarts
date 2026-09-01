


import NextAuth, { type NextAuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/app/lib/prisma";

import {
  credentialsProvider,
  verifiedLoginProvider,
} from "./auth/providers";

import { callbacks } from "./auth/session";

import {
  SESSION_MAX_AGE,
  JWT_MAX_AGE,
} from "./auth/constants";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",

  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },

  jwt: {
    maxAge: JWT_MAX_AGE,
  },

  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },

  providers: [
    credentialsProvider,

    verifiedLoginProvider,

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  callbacks,
};

export default NextAuth(authOptions);