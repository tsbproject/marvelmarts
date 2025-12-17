// lib/registration.ts
import { prisma } from "@/app/lib/prisma";
import { VerificationType } from "@prisma/client";

export async function getLatestVerification(email: string, type: VerificationType) {
  const verification = await prisma.verificationCode.findFirst({
    where: { email, type, used: true },
    orderBy: { createdAt: "desc" },
  });
  return verification;
}

export function validateVerification(verification: any) {
  if (!verification) {
    return { valid: false, error: "Email not verified" };
  }
  if (verification.expiresAt < new Date()) {
    return { valid: false, error: "Verification expired" };
  }
  if (!verification.hashedPassword) {
    return { valid: false, error: "Password missing from verification record" };
  }
  return { valid: true };
}

export async function cleanupVerification(email: string, type: VerificationType) {
  await prisma.verificationCode.deleteMany({ where: { email, type } });
}
