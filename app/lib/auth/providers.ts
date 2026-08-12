import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { getUserForAuth,} from "./helper";

import {
  mapAuthUser,
} from "./mappers";

/* -------------------------------------------------------------------------- */
/*                      EMAIL / PASSWORD PROVIDER                             */
/* -------------------------------------------------------------------------- */

export const credentialsProvider = CredentialsProvider({
  name: "Credentials",

  credentials: {
    identifier: {
      label: "Email",
      type: "text",
    },

    password: {
      label: "Password",
      type: "password",
    },
  },

  async authorize(credentials) {
    try {
      if (
        !credentials?.identifier ||
        !credentials?.password
      ) {
        return null;
      }

      const identifier =
        credentials.identifier
          .toLowerCase()
          .trim();

      const user =
        await getUserForAuth({
          email: {
            equals: identifier,
            mode: "insensitive",
          },
        });

      if (!user) {
        return null;
      }

      if (!user.passwordHash) {
        return null;
      }

      const valid = await bcrypt.compare(
        credentials.password,
        user.passwordHash
      );

      if (!valid) {
        return null;
      }

      return mapAuthUser(user);
    } catch (error) {
      console.error(
        "CREDENTIAL_LOGIN_ERROR",
        error
      );

      return null;
    }
  },
});

/* -------------------------------------------------------------------------- */
/*                       VERIFIED LOGIN PROVIDER                              */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                       VERIFIED LOGIN PROVIDER                              */
/* -------------------------------------------------------------------------- */

export const verifiedLoginProvider =
  CredentialsProvider({
    id: "verified-login",

    name: "Verified Login",

    credentials: {
      token: {
        label: "Token",
        type: "text",
      },
    },

    async authorize(credentials) {
      try {
        if (!credentials?.token) {
          return null;
        }

        const secret =
          process.env.NEXTAUTH_SECRET;

        if (!secret) {
          console.error(
            "VERIFIED_LOGIN_ERROR: NEXTAUTH_SECRET is missing."
          );

          return null;
        }

        const decoded = jwt.verify(
          credentials.token,
          secret
        ) as {
          purpose: string;
          uid: string;
          userId: string;
          email: string;
        };

        if (
          decoded.purpose !==
          "verified-login"
        ) {
          return null;
        }

        const user =
          await getUserForAuth({
            id: decoded.userId,
          });

        if (!user) {
          return null;
        }

        if (
          user.email.toLowerCase() !==
          decoded.email.toLowerCase()
        ) {
          return null;
        }

        return mapAuthUser(user);
      } catch (error) {
        console.error(
          "VERIFIED_LOGIN_ERROR",
          error
        );

        return null;
      }
    },
  });