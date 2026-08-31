import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthLogService } from "@/app/lib/services/logging";
import { SecurityLogService } from "@/app/lib/services/logging";

import { getUserForAuth } from "./helper";
import { logger } from "@/app/lib/logger";
import {
  isBlocked,
  recordFailure,
  resetAttempts,
} from "@/app/lib/rateLimiter";

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
        await AuthLogService.loginFailure({
          email: credentials?.identifier,
        });

        return null;
      }
            const identifier =
              credentials.identifier
                .toLowerCase()
                .trim();

     if (isBlocked(identifier)) {
        await SecurityLogService.rateLimitExceeded({
          metadata: {
            email: identifier,
            provider: "credentials",
          },
        });

  throw new Error("RATE_LIMIT");
}
      const user =
        await getUserForAuth({
          email: {
            equals: identifier,
            mode: "insensitive",
          },
        });

     if (!user) {
      await AuthLogService.loginFailure({
        email: identifier,
      });

      return null;
    }


    if (user.isSuspended) {
      await SecurityLogService.permissionDenied({
        userId: user.id,
        metadata: {
          reason: "Suspended account",
          email: user.email,
        },
      });

      throw new Error("ACCOUNT_SUSPENDED");
    }

     if (!user.passwordHash) {
        await AuthLogService.loginFailure({
          userId: user.id,
          email: user.email,
        });

        return null;
      }




      const valid =
        await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

      if (!valid) {
        recordFailure(identifier);

        await AuthLogService.loginFailure({
          userId: user.id,
          email: user.email,
        });

        return null;
      }


      resetAttempts(identifier);


      return mapAuthUser(user);


  } catch (error) {
      logger.error(
        "CREDENTIAL_LOGIN_ERROR",
        error
      );

      throw error;
    }
  },
});

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
          logger.error(
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

        await AuthLogService.loginSuccess({
          userId: user.id,
          email: user.email,
        });


        

        return mapAuthUser(user);
        
      } catch (error) {
        logger.error(
          "VERIFIED_LOGIN_ERROR",
          error
        );

        return null;
      }
    },
  });