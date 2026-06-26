import NextAuth, {type NextAuthOptions,} from "next-auth";

import {credentialsProvider, verifiedLoginProvider,} from "./auth/providers";

import {callbacks,} from "./auth/session";

import { SESSION_MAX_AGE, JWT_MAX_AGE,} from "./auth/constants";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",

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
  ],

  callbacks,
};

export default NextAuth(authOptions);




