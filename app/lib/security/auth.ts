import { getServerSession } from "next-auth";

import { authOptions } from "@/app/lib/auth";

import {
  AuthenticatedSession,
  SecurityError,
} from "./types";

export async function requireAuth(): Promise<AuthenticatedSession> {
  const session =
    (await getServerSession(
      authOptions
    )) as AuthenticatedSession | null;

  if (!session?.user?.id) {
    throw new SecurityError(
      "Authentication required.",
      401
    );
  }

  return session;
}

export async function requireActiveUser() {
  const session = await requireAuth();

  if (session.user.isSuspended) {
    throw new SecurityError(
      "Your account has been suspended.",
      403
    );
  }

  return session;
}