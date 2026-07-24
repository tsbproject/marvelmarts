import { NextRequest } from "next/server";

import { unauthorized } from "@/app/lib/auth/errors";

export function requireCronAuth(
  req: NextRequest
) {
  const authHeader =
    req.headers.get("authorization");

  if (
    authHeader !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    throw unauthorized(
      "Invalid cron authorization."
    );
  }
}