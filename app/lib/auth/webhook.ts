import crypto from "crypto";
import { NextRequest } from "next/server";

import { unauthorized } from "@/app/lib/auth/errors";

export async function requirePaystackWebhook(
  request: NextRequest
) {
  const body = await request.text();

  const signature =
    request.headers.get("x-paystack-signature");

  if (!signature) {
    throw unauthorized(
      "Missing webhook signature."
    );
  }

  const hash = crypto
    .createHmac(
      "sha512",
      process.env.PAYSTACK_SECRET_KEY!
    )
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    throw unauthorized(
      "Invalid webhook signature."
    );
  }

  return JSON.parse(body);
}