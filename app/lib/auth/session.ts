import type { NextAuthOptions } from "next-auth";

import { AUTH_REFRESH_INTERVAL } from "./constants";
import { getFreshUserData } from "./helper";
import { mapAuthUser } from "./mappers";
import {
  applyAuthUserToToken,
  applyTokenToSession,
} from "./token";

import type { AuthUser } from "./types";

export const callbacks: NextAuthOptions["callbacks"] = {
  async jwt({
    token,
    user,
    trigger,
  }) {
    /* ---------------------------------------------------------------------- */
    /* FIRST LOGIN                                                            */
    /* ---------------------------------------------------------------------- */

    if (user) {
      return applyAuthUserToToken(
        token,
        user as AuthUser
      );
    }

    /* ---------------------------------------------------------------------- */
    /* PERIODIC / MANUAL DATABASE REFRESH                                     */
    /* ---------------------------------------------------------------------- */

    if (
      token.userId &&
      (
        !token.lastSync ||
        Date.now() - token.lastSync >
          AUTH_REFRESH_INTERVAL ||
        trigger === "update"
      )
    ) {
      const dbUser =
        await getFreshUserData(
          token.userId
        );

      if (dbUser) {
        const authUser =
          mapAuthUser(dbUser);

        return applyAuthUserToToken(
          token,
          authUser
        );
      }
    }

    return token;
  },

  async session({
    session,
    token,
  }) {
    return applyTokenToSession(
      session,
      token
    );
  },
};